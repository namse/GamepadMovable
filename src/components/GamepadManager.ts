import GamepadEventListener from './GamepadEventListener';

export enum GamepadButtonName {
    A = 0,
    B = 1,
    X = 2,
    Y = 3,
    LeftBumper = 4,
    RightBumper = 5,
    LeftTrigger = 6,
    RightTrigger = 7,
    Back = 8,
    Start = 9,
    LeftAxisButton = 10,
    RightAxisButton = 11,
    Up = 12,
    Down = 13,
    Left = 14,
    Right = 15,
}

export enum GamepadButtonEventType {
    ButtonDown = 'ButtonDown',
    ButtonUp = 'ButtonUp',
};

export interface GamepadButtonEvent {
    eventType: GamepadButtonEventType;
    gamepadButtonName: GamepadButtonName;
}

class GamepadManager {
    private gamepadEventListeners: GamepadEventListener[] = [];
    private gamepads: Gamepad[] = [];
    private prevGamepadButtons: GamepadButton[] = [];
    constructor() {
        this.onGamepadConnected = this.onGamepadConnected.bind(this);
        this.onGamepadDisconnected = this.onGamepadDisconnected.bind(this);
        this.tick = this.tick.bind(this);

        window.addEventListener('gamepadconnected', this.onGamepadConnected as () => void);
        window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected as () => void);
        this.tick();
    }
    public destroy() {
        window.removeEventListener('gamepadconnected', this.onGamepadConnected as () => void);
        window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected as () => void);
    }

    public addGamepadEventListner(gamepadEventListener: GamepadEventListener) {
        this.gamepadEventListeners.push(gamepadEventListener);
    }
    public removeGamepadEventListner(gamepadEventListener: GamepadEventListener) {
        const index = this.gamepadEventListeners.indexOf(gamepadEventListener);
        this.gamepadEventListeners.splice(index, 1);
    }
    private onGamepadConnected(event: GamepadEvent) {
        console.log('onGamepadConnected', event);
        this.gamepads.push(event.gamepad);
    }
    private onGamepadDisconnected(event: GamepadEvent) {
        const index = this.gamepads.findIndex(gamepad => gamepad.index === event.gamepad.index);
        if (index === -1) {
            console.error('cannot find gamepad', event);
            return;
        }
        this.gamepads.splice(index, 1);
    }
    private propagateEvent(eventType: GamepadButtonEventType, gamepadButtonName: GamepadButtonName) {
        console.log('propagateEvent', eventType, gamepadButtonName);
        const event: GamepadButtonEvent = {
            eventType,
            gamepadButtonName,
        };
        this.gamepadEventListeners.forEach(listener => {
            listener.eventCallbacks.forEach(callback => callback(event));
            listener.eventTypeCallbacks[eventType].forEach(callback => callback(event))
        });
    }
    private tick() {
        const gamepads = navigator.getGamepads();
        let gamepad;
        for (let i = 0; i <gamepads.length; i += 1 ) {
            if (gamepads[i]) {
                gamepad = gamepads[i];
                break;
            }
        }
        if (!gamepad) {
            requestAnimationFrame(this.tick);
            return;
        }

        gamepad.buttons.forEach((gamepadButton, buttonIndex) => {
            const prevGamepadButton = this.prevGamepadButtons[buttonIndex];
            if (!prevGamepadButton) {
                return;
            }
            const gamepadButtonName = buttonIndex as GamepadButtonName;
            if (gamepadButton.value) {
                console.log(gamepadButtonName, gamepadButton.value, prevGamepadButton.value, gamepadButton.pressed, prevGamepadButton.pressed);
            }
            if (gamepadButton.pressed && !prevGamepadButton.pressed) {
                // down
                const eventType = GamepadButtonEventType.ButtonDown;
                console.log('down', gamepadButtonName);
                this.propagateEvent(eventType, gamepadButtonName);
            }
            else if (!gamepadButton.pressed && prevGamepadButton.pressed) {
                // up
                const eventType = GamepadButtonEventType.ButtonUp;
                console.log('up', gamepadButtonName);
                this.propagateEvent(eventType, gamepadButtonName);
            }
        });

        this.prevGamepadButtons = gamepad.buttons.map(button => ({
            value: button.value,
            touched: button.touched,
            pressed: button.pressed,
        }));

        requestAnimationFrame(this.tick);
    }

}

const gamepadManager = new GamepadManager();
export default gamepadManager;
