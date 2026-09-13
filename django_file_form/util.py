def get_list(v):
    if isinstance(v, list):
        return v
    else:
        return [v]


def compact(items):
    return [v for v in items if v]
