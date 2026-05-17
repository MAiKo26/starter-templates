from fastapi import APIRouter, Depends, Response

from src.schemas.common_schemas import ErrorResponse
from src.schemas.task_schemas import (
    TaskCreate,
    TaskListQuery,
    TaskListResponse,
    TaskResponse,
    TaskUpdate,
)
from src.services.task_service import TaskService, get_task_service

router = APIRouter(prefix="/projects/{project_id}/tasks", tags=["Tasks"])


@router.get(
    "",
    response_model=TaskListResponse,
    summary="List tasks for a project",
)
async def list_tasks(
    project_id: str,
    query: TaskListQuery = Depends(),
    service: TaskService = Depends(get_task_service),
) -> TaskListResponse:
    from uuid import UUID

    items, meta = await service.list(
        project_id=UUID(project_id),
        status=query.status,
        priority=query.priority,
        assignee_id=query.assignee_id,
        limit=query.limit,
        offset=query.offset,
    )
    return TaskListResponse(
        data=[
            TaskResponse(
                id=t.id,
                project_id=t.project_id,
                title=t.title,
                description=t.description,
                status=t.status,
                priority=t.priority,
                assignee_id=t.assignee_id,
                due_date=t.due_date,
                created_at=t.created_at,
                updated_at=t.updated_at,
            )
            for t in items
        ],
        meta=meta,
    )


@router.get(
    "/{id}",
    response_model=TaskResponse,
    summary="Get task by ID",
    responses={404: {"model": ErrorResponse}},
)
async def get_task(
    id: str,
    service: TaskService = Depends(get_task_service),
) -> TaskResponse:
    from uuid import UUID

    task = await service.find_by_id(UUID(id))
    return TaskResponse(
        id=task.id,
        project_id=task.project_id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        assignee_id=task.assignee_id,
        due_date=task.due_date,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@router.post(
    "",
    response_model=TaskResponse,
    status_code=201,
    summary="Create a task",
)
async def create_task(
    project_id: str,
    params: TaskCreate,
    service: TaskService = Depends(get_task_service),
) -> TaskResponse:
    from uuid import UUID

    task = await service.create(UUID(project_id), params)
    return TaskResponse(
        id=task.id,
        project_id=task.project_id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        assignee_id=task.assignee_id,
        due_date=task.due_date,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@router.patch(
    "/{id}",
    response_model=TaskResponse,
    summary="Update a task",
    responses={404: {"model": ErrorResponse}},
)
async def update_task(
    id: str,
    params: TaskUpdate,
    service: TaskService = Depends(get_task_service),
) -> TaskResponse:
    from uuid import UUID

    task = await service.update(UUID(id), params)
    return TaskResponse(
        id=task.id,
        project_id=task.project_id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        assignee_id=task.assignee_id,
        due_date=task.due_date,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@router.delete(
    "/{id}",
    status_code=204,
    summary="Delete a task",
    responses={404: {"model": ErrorResponse}},
)
async def delete_task(
    id: str,
    service: TaskService = Depends(get_task_service),
) -> Response:
    from uuid import UUID

    await service.delete(UUID(id))
    return Response(status_code=204)
