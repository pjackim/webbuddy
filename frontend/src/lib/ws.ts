import { WS_BASE } from './api';
import { upsertAsset, removeAsset, upsertScreen, removeScreen } from './stores';

let socket: WebSocket | null = null;

export function connectWS() {
  if (socket) return socket;
  socket = new WebSocket(WS_BASE);
  socket.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      const { event, data } = msg;
      if (event === 'asset_added' || event === 'asset_updated') upsertAsset(data);
      if (event === 'asset_deleted') removeAsset(data.id);
      if (event === 'screen_added' || event === 'screen_updated') upsertScreen(data);
      if (event === 'screen_deleted') removeScreen(data.id);
    } catch (e) {
      console.error('WS parse error', e);
    }
  };
  socket.onclose = () => {
    socket = null;
    setTimeout(connectWS, 1000); // simple reconnect
  };
  return socket;
}
