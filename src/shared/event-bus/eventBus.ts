import { EventEmitter } from "events";
import { EventType } from "../events/eventTypes";

class AppEventBus {
    private readonly emitter = new EventEmitter();

    emit<TPayload>(eventType: EventType, payload: TPayload): void {
        this.emitter.emit(eventType, payload);
    }

    on<TPayload>(
        eventType: EventType,
        listener: (payload: TPayload) => void | Promise<void>,
    ): void {
        this.emitter.on(eventType, async (payload: TPayload) => {
            try {
                await listener(payload);
            } catch (error) {
                console.error(`[EventBus Error] ${eventType}`, error);
            }
        });
    }
}

export const eventBus = new AppEventBus();