def get_list(v):
    if isinstance(v, list):
        return v
    else:
        return [v]


def compact(l):
    return [v for v in l if v]
