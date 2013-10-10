from django.db import connection


def table_exists(table_name):
    return table_name in connection.introspection.table_names()
