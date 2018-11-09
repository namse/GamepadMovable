import gamepadManager, { GamepadButtonEvent, GamepadButtonEventType } from './GamepadManager';

export default class GamepadEventListener {
    eventCallbacks: Array<(event: GamepadButtonEvent) => void> = [];
    eventTypeCallbacks: {
        [eventType in GamepadButtonEventType]: Array<(event: GamepadButtonEvent) => void>
    } = {
        ButtonDown: [],
        ButtonUp: [],
    };
    constructor() {
        gamepadManager.addGamepadEventListner(this);
    }
    destroy() {
        gamepadManager.removeGamepadEventListner(this);
    }
    onEventType(eventType: GamepadButtonEventType, callback: (event: GamepadButtonEvent) => void) {
        this.eventTypeCallbacks[eventType].push(callback);
    }
    on(callback: (event: GamepadButtonEvent) => void) {
        this.eventCallbacks.push(callback);
    }
}
