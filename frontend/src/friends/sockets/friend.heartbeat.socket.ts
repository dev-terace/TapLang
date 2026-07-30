import type { Socket } from "socket.io-client";

let heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
let heartbeatRunning = false;

const HEARTBEAT_INTERVAL = 30000;
const HEARTBEAT_RETRY_INTERVAL = 5000;
const HEARTBEAT_TIMEOUT = 5000;




export const startHeartbeat = (socket: Socket) => {

    const initPresence = () => {
        socket.emit("friend:own:init");
        console.log("다른 탭 emit 실행")
    };

    if (heartbeatRunning) {
        return;
    }

    heartbeatRunning = true;

    const heartbeat = () => {
        if (!heartbeatRunning) {
            return;
        }

        if (!socket.connected) {
            heartbeatTimer = setTimeout(heartbeat, HEARTBEAT_RETRY_INTERVAL);
            return;
        }

        socket
            .timeout(HEARTBEAT_TIMEOUT)
            .emit("friend:heartbeat", (err: Error | null) => {
                const nextDelay = err
                    ? HEARTBEAT_RETRY_INTERVAL
                    : HEARTBEAT_INTERVAL;

                heartbeatTimer = setTimeout(heartbeat, nextDelay);
            });
    };

    heartbeat();

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            initPresence();
        }
    });
    window.addEventListener("focus", initPresence);

};

export const stopHeartbeat = () => {
    heartbeatRunning = false;

    if (heartbeatTimer) {
        clearTimeout(heartbeatTimer);
        heartbeatTimer = null;
    }
};