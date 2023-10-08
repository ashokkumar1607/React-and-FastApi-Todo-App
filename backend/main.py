from fastapi import FastAPI,Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import SessionLocal,engine
import models


app=FastAPI()
origins=[
    'http://localhost:5173'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

class TodoBase(BaseModel):
    title:str
    description:str

class Todo(TodoBase):
    id:int
    
    class Config:
        orm_mode=True


def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependancy=Annotated[Session,Depends(get_db)]

models.Base.metadata.create_all(bind=engine)

@app.post('/todos',response_model=Todo)
async def post_todo(todo:TodoBase,db:db_dependancy):
    db_todo=models.Todo(**todo.dict())
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

@app.get('/todos',response_model=list[Todo])
async def get_all(db:db_dependancy,skip:int=0,limit:int=100):
    todos= db.query(models.Todo).offset(skip).limit(limit).all()
    return todos

@app.get('/todo/{todo_id}',response_model=Todo)
async def get_one(todo_id:int,db:db_dependancy):
    todo=db.query(models.Todo).filter(models.Todo.id==todo_id).first()
    return todo

@app.put('/todo/{todo_id}',response_model=Todo)
async def update_todo(todo_id:int,todo:TodoBase,db:db_dependancy):
    db_todo=db.query(models.Todo).filter(models.Todo.id==todo_id).first()
    db_todo.title=todo.title
    db_todo.description=todo.description
    db.commit()
    return db_todo

@app.delete('/todo/{todo_id}')
async def delete_todo(todo_id:int,db:db_dependancy):
    db.query(models.Todo).filter(models.Todo.id==todo_id).delete(synchronize_session=False)
    db.commit()
    return {'Message':'Deleted Successfully'}