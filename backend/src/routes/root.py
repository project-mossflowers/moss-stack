from fastapi import APIRouter, Depends
from src.database import get_session
from src.routes.models import Song, SongCreate
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession


router = APIRouter(tags=["root"])


@router.get("/ping")
async def pong():
    return {"ping": "pong!"}


@router.get("/songs", response_model=list[Song])
async def get_songs(session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(Song))
    songs = result.all()
    return [Song(name=song.name, artist=song.artist, id=song.id) for song in songs]


@router.post("/songs")
async def add_song(song: SongCreate, session: AsyncSession = Depends(get_session)):
    song = Song(name=song.name, artist=song.artist)
    session.add(song)
    await session.commit()
    await session.refresh(song)
    return song

