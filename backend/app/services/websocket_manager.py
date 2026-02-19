from fastapi import WebSocket


class WebSocketManager:
    """
    Manages all active WebSocket connections.
    Think of it as a room — users join, receive messages, and leave.
    """

    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        print(f"✅ WebSocket connected: {session_id}")

    def disconnect(self, session_id: str):
        """Remove a disconnected WebSocket."""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            print(f"👋 WebSocket disconnected: {session_id}")

    async def send_to_session(self, session_id: str, data: dict):
        """Send a message to one specific session."""
        if session_id in self.active_connections:
            websocket = self.active_connections[session_id]
            try:
                await websocket.send_json(data)
            except Exception:
                self.disconnect(session_id)

    async def broadcast(self, data: dict):
        """Send a message to ALL connected sessions."""
        disconnected = []
        for session_id, websocket in self.active_connections.items():
            try:
                await websocket.send_json(data)
            except Exception:
                disconnected.append(session_id)
        for session_id in disconnected:
            self.disconnect(session_id)

    @property
    def connection_count(self) -> int:
        return len(self.active_connections)


# Single instance shared across the entire app
ws_manager = WebSocketManager()