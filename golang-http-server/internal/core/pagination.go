package core

type PaginationQuery struct {
	Limit  int `json:"limit"`
	Offset int `json:"offset"`
}

type PaginationMeta struct {
	Total  int `json:"total"`
	Limit  int `json:"limit"`
	Offset int `json:"offset"`
}

func BuildPaginationMeta(total, limit, offset int) PaginationMeta {
	return PaginationMeta{
		Total:  total,
		Limit:  limit,
		Offset: offset,
	}
}

func DefaultPaginationQuery() PaginationQuery {
	return PaginationQuery{
		Limit:  20,
		Offset: 0,
	}
}
