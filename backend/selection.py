import datetime
from typing import List, Dict, Union, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func  # Импортируем func для min/max агрегации

# Импортируем CRUD функции
from backend.crud import manufacture
from backend.crud import resources
from backend.crud import order
from backend.crud import order_resources  # Для получения ресурсов заказа

# Импортируем гео-библиотеку
from geopy.distance import geodesic as gd

OMEGA_T = 0.5  # Вес для времени выполнения
OMEGA_D = 0.3  # Вес для дистанции
OMEGA_R = 0.2  # Вес для репутации (R_i)

ALPHA = 1  # Параметр для успешности (R_i)
BETA = 2  # Параметр для успешности (R_i)
GAMMA = 0.1  # Коэффициент влияния продолжительности работы (R_i)


class Selection:
    def __init__(self, db: Session, order_id: int, required_resource_types: List[str]):
        self.db = db
        self.order_id = order_id
        self.required_resource_types = required_resource_types

        self.manufacturers_data: Dict[int, Dict[str, Any]] = {}
        """
        Словарь хранит:
        {
          manufacture_id: {
              'T_i': float,         
              'D_i': float,         
              'S_i': int,           
              'F_i': int,           
              'L_i': int,           
              'R_i': float,         
              'Rate_i': float       
          }
        }
        """
        self.T_min: Optional[float] = None
        self.D_min: Optional[float] = None
        self.L_max: Optional[int] = None

    def _collect_initial_data(self) -> bool:
        """Собирает начальные данные о производителях (время выполнения, успешность, стаж)."""
        manufacturers_ready_times = resources.get_manufactures_with_ready_time(self.db, self.required_resource_types)
        print(f"DEBUG: Manufacturers with required resources (T_i): {manufacturers_ready_times}")

        if not manufacturers_ready_times:
            print("INFO: No manufacturers found with all required resources.")
            return False

        for man_id, t_i_val in manufacturers_ready_times.items():
            self.manufacturers_data[man_id] = {'T_i': float(t_i_val)}

        manufacturers_ids = list(self.manufacturers_data.keys())
        criteria_data = manufacture.get_rating_criteria(self.db, manufacturers_ids)

        current_date = datetime.datetime.now().date()
        all_l_i_values = []

        for man_id, s_i_val, f_i_val, start_date_obj in criteria_data:
            if man_id in self.manufacturers_data:
                self.manufacturers_data[man_id]['S_i'] = s_i_val
                self.manufacturers_data[man_id]['F_i'] = f_i_val

                l_i_val = (current_date - start_date_obj.date()).days
                self.manufacturers_data[man_id]['L_i'] = l_i_val
                all_l_i_values.append(l_i_val)

        if all_l_i_values:
            self.L_max = max(all_l_i_values)
            if self.L_max == 0:
                self.L_max = 1
        else:
            self.L_max = 1

        print(f"DEBUG: Initial data collected: {self.manufacturers_data}")
        print(f"DEBUG: L_max: {self.L_max}")
        return True

    def _calculate_distances(self) -> bool:
        """Рассчитывает дистанции (D_i) и находит D_min."""
        manufacturers_ids = list(self.manufacturers_data.keys())
        if not manufacturers_ids:
            return False

        order_geo = order.get_orders_geoip_by_id(self.db, self.order_id)
        if not order_geo:
            print(f"ERROR: Geoip data not found for order ID {self.order_id}")
            return False

        order_coords = (order_geo.geoip_lat, order_geo.geoip_lon)
        all_d_i_values = []

        for man_id in manufacturers_ids:
            man_locs = manufacture.get_manufactures_locations_by_id(self.db, [man_id])
            if man_locs:
                _, man_lat, man_lon = man_locs[0]
                man_coords = (man_lat, man_lon)
                d_i_val = round(gd(order_coords, man_coords).km, 2)
                self.manufacturers_data[man_id]['D_i'] = d_i_val
                all_d_i_values.append(d_i_val)
            else:
                print(
                    f"WARNING: No geoip data for manufacturer {man_id}. Skipping distance calculation for this manufacturer.")
                self.manufacturers_data.pop(man_id, None)

        if all_d_i_values:
            self.D_min = min(all_d_i_values)
            if self.D_min == 0:
                self.D_min = 0.001
        else:
            self.D_min = 1

        print(f"DEBUG: Distances calculated: {self.manufacturers_data}")
        print(f"DEBUG: D_min: {self.D_min}")
        return True

    def _calculate_R_i(self):
        """Рассчитывает репутацию R_i для каждого производителя."""
        for man_id, data in list(
                self.manufacturers_data.items()):
            S_i = data.get('S_i', 0)
            F_i = data.get('F_i', 0)
            L_i = data.get('L_i', 0)


            denominator_success = S_i + F_i + BETA
            if denominator_success == 0:
                success_term = (S_i + ALPHA) / 1
            else:
                success_term = (S_i + ALPHA) / denominator_success

            if self.L_max is None or self.L_max == 0:
                experience_term = 1
            else:
                experience_term = (1 + GAMMA * (L_i / self.L_max))

            R_i = success_term * experience_term
            self.manufacturers_data[man_id]['R_i'] = round(R_i, 3)
            print(
                f"DEBUG: R_i for manufacturer {man_id}: {R_i} (Success Term: {success_term}, Experience Term: {experience_term})")  # Лог для отладки

    def _calculate_Rate_i(self):
        """Рассчитывает итоговый рейтинг Rate_i для каждого производителя и находит T_min."""
        all_t_i_values = []
        for man_id, data in self.manufacturers_data.items():
            all_t_i_values.append(data['T_i'])

        if all_t_i_values:
            self.T_min = min(all_t_i_values)
            if self.T_min == 0:
                self.T_min = 0.001
        else:
            self.T_min = 1

        for man_id, data in self.manufacturers_data.items():
            T_i = data['T_i']
            D_i = data['D_i']
            R_i = data['R_i']



            term_T = OMEGA_T * (self.T_min / T_i)
            term_D = OMEGA_D * (self.D_min / D_i)
            term_R = OMEGA_R * R_i

            Rate_i = term_T + term_D + term_R
            self.manufacturers_data[man_id]['Rate_i'] = round(Rate_i, 3)
            print(
                f"DEBUG: Rate_i for manufacturer {man_id}: {Rate_i} (Term_T: {term_T}, Term_D: {term_D}, Term_R: {term_R})")  # Лог для отладки

    def get_best_manufacturer(self) -> Union[int, str]:
        """
        Основной метод, выполняющий всю цепочку расчетов и выбирающий лучшего производителя.
        Возвращает ID лучшего производителя (int) или сообщение об ошибке (str).
        """
        if not self._collect_initial_data():
            return "Подходящих производств нет или нет данных."

        if not self._calculate_distances():
            return "Не удалось рассчитать дистанции."

        self._calculate_R_i()

        self._calculate_Rate_i()

        if not self.manufacturers_data:
            return "Нет производителей, соответствующих всем критериям."

        best_manufacturer_id = None
        max_rate = -1.0

        for man_id, data in self.manufacturers_data.items():
            current_rate = data.get('Rate_i')
            if current_rate is not None and current_rate > max_rate:
                max_rate = current_rate
                best_manufacturer_id = man_id

        if best_manufacturer_id is None:
            return "Не удалось выбрать лучшего производителя (возможно, все Rate_i отрицательные или None)."

        print(f"INFO: Best manufacturer selected: {best_manufacturer_id} with Rate_i {max_rate}")
        return best_manufacturer_id


def select_best_manufacturer(db: Session, order_id: int) -> Union[int, str]:
    """
    Выбирает лучшего производителя для указанного заказа.
    Получает необходимые ресурсы заказа из БД.
    Возвращает ID лучшего производителя или сообщение об ошибке.
    """
    order_resources_list = order_resources.get_order_resources_by_order_id(db, order_id=order_id)
    if not order_resources_list:
        print(f"ERROR: No resources specified for order ID {order_id}. Cannot select manufacturer.")
        return "Для выбора производителя не указаны требуемые ресурсы."

    required_resource_types = [res.type_resource for res in order_resources_list]

    selection_logic = Selection(db=db, order_id=order_id, required_resource_types=required_resource_types)
    best_manufacturer_id = selection_logic.get_best_manufacturer()  # Вызываем основной метод

    return best_manufacturer_id