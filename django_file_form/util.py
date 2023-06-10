from typing import Type, TYPE_CHECKING, TypeVar


def get_list(v):
    if isinstance(v, list):
        return v
    else:
        return [v]


def compact(l):
    return [v for v in l if v]


T = TypeVar("T")


def with_typehint(baseclass: Type[T]) -> Type[T]:
    """
    Useful function to make mixins with baseclass typehint

    ```
    class ReadonlyMixin(with_typehint(BaseAdmin))):
        ...
    ```
    """
    if TYPE_CHECKING:
        return baseclass

    return object
