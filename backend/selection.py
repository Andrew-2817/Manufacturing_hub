import datetime
from typing import List

from sqlalchemy.orm import Session
from backend.database import engine
from backend.crud import manufacture
from backend.crud import resources
from backend.crud import order
from geopy.distance import geodesic as gd



class Selection:
    def __init__(self, order_id: int, type_resource: List[str], resource_count: int):
        self.order_id = order_id
        self.type_resource = type_resource
        self.resource_count = resource_count
        self.period_execution = {}
        self.distant = {}
        self.rating = {}

    def determining_distance(self, order_id: int, manufacturers_id: List[int]):
        """
        :param order_id: ID заказа
        :param manufacturers_id: список ID производителей
        :return:

        Метод для расчета дистанций между предприятием и заказчиком
        """
        manufactures = manufacture.get_manufactures_locations_by_id(Session(bind=engine), manufacturers_id)
        geo_of_order = order.get_orders_geoip_by_id(Session(bind=engine), order_id)
        for man in manufactures:
            self.distant[man[0]] = round(gd(man[1:], geo_of_order).km, 2)

        return "Successfully"

    def performers_rating_calculating(self, manufacturers_id: List[int]):
        """
        :param manufacturers_id: список ID производителей
        :return:

        Метод для расчета рейтинга на основе кол-ва успешных заказов,
        проваленных заказов и продолжительности работы исполнителя в системе
        """
        manufactures_criteria = manufacture.get_rating_criteria(Session(bind=engine), manufacturers_id)
        max_start_date = manufacture.get_max_start_date(Session(bind=engine))

        for criteria in manufactures_criteria:
            self.rating[criteria[0]] = round((criteria[1]+1)/(criteria[1]+criteria[2]+2) *
                                             (1+0.1*(datetime.datetime.now().date() - criteria[3].date()).days /
                                             (datetime.datetime.now().date() - max_start_date.date()).days), 3)

        return "Successfully"

    def rating_calculating(self):
        self.period_execution = resources.get_manufactures_with_ready_time(Session(bind=engine),  self.type_resource)
        if not self.period_execution:
            return 'Подходящих производств нет.'
        if len(self.period_execution) == 1:
            return self.period_execution
        else:
            self.determining_distance(self.order_id, list(self.period_execution))
            self.performers_rating_calculating(list(self.period_execution))
            rating_manufacturers = {}
            for manufacturer in self.period_execution:
                rating_manufacturers[manufacturer] = round(0.5 * self.period_execution[manufacturer] + 0.3 * self.distant[manufacturer] + 0.2 * self.rating[manufacturer], 3)
            print(rating_manufacturers)
            return max(rating_manufacturers, key=rating_manufacturers.get)



a = Selection(1, ['токарный', 'фрезерный'], 1)
print(a.rating_calculating())
print(a.period_execution)
print(a.distant)
print(a.rating)
