from fastapi import APIRouter, Depends, Response

from src.schemas.common_schemas import ErrorResponse
from src.schemas.project_schemas import (
    ProjectCreate,
    ProjectListQuery,
    ProjectListResponse,
    ProjectResponse,
    ProjectUpdate,
)
from src.services.project_service import ProjectService, get_project_service

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get(
    "",
    response_model=ProjectListResponse,
    summary="List projects",
)
async def list_projects(
    query: ProjectListQuery = Depends(),
    service: ProjectService = Depends(get_project_service),
) -> ProjectListResponse:
    items, meta = await service.list(
        search=query.search,
        status=query.status,
        limit=query.limit,
        offset=query.offset,
    )
    return ProjectListResponse(
        data=[
            ProjectResponse(
                id=p.id,
                name=p.name,
                description=p.description,
                status=p.status,
                owner_id=p.owner_id,
                created_at=p.created_at,
                updated_at=p.updated_at,
            )
            for p in items
        ],
        meta=meta,
    )


@router.get(
    "/{id}",
    response_model=ProjectResponse,
    summary="Get project by ID",
    responses={404: {"model": ErrorResponse}},
)
async def get_project(
    id: str,
    service: ProjectService = Depends(get_project_service),
) -> ProjectResponse:
    from uuid import UUID

    project = await service.find_by_id(UUID(id))
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        status=project.status,
        owner_id=project.owner_id,
        created_at=project.created_at,
        updated_at=project.updated_at,
    )


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=201,
    summary="Create a project",
)
async def create_project(
    params: ProjectCreate,
    service: ProjectService = Depends(get_project_service),
) -> ProjectResponse:
    project = await service.create(params)
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        status=project.status,
        owner_id=project.owner_id,
        created_at=project.created_at,
        updated_at=project.updated_at,
    )


@router.patch(
    "/{id}",
    response_model=ProjectResponse,
    summary="Update a project",
    responses={404: {"model": ErrorResponse}},
)
async def update_project(
    id: str,
    params: ProjectUpdate,
    service: ProjectService = Depends(get_project_service),
) -> ProjectResponse:
    from uuid import UUID

    project = await service.update(UUID(id), params)
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        status=project.status,
        owner_id=project.owner_id,
        created_at=project.created_at,
        updated_at=project.updated_at,
    )


@router.delete(
    "/{id}",
    status_code=204,
    summary="Delete a project",
    responses={404: {"model": ErrorResponse}},
)
async def delete_project(
    id: str,
    service: ProjectService = Depends(get_project_service),
) -> Response:
    from uuid import UUID

    await service.delete(UUID(id))
    return Response(status_code=204)
