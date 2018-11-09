import GamepadEventListener from './GamepadEventListener';
import { GamepadButtonEventType, GamepadButtonName } from './GamepadManager';
import GamepadMovable from './GamepadMovable';

export default class GamepadMover {
    private gamepadEventListener: GamepadEventListener = new GamepadEventListener;
    private prevMovable: GamepadMovable | undefined;
    private currentMovable: GamepadMovable | undefined;
    activate() {
        this.gamepadEventListener.onEventType(GamepadButtonEventType.ButtonDown, (event) => {
            if (event.gamepadButtonName === GamepadButtonName.Down) {
                this.moveDown();
                return;
            }
            if (event.gamepadButtonName === GamepadButtonName.Up) {

            }
        });
    }
    deactivate() {
        this.gamepadEventListener.destroy();
    }
    private moveTo(movable: GamepadMovable) {
        if (this.prevMovable) {
            this.prevMovable.onLeave();
        }
        movable.onEnter();
        this.prevMovable = movable;
    }
    private moveDown() {
        // 현재 무버블을 기준으로
        // 아래로 이동합시다.
        // 이동 후 이벤트 전파합니다.
        // 예를 들면, 스크롤 이벤트가 이루어져야겠죠?
        // 알면 만드세요.
        if (!this.currentMovable) {
            this.currentMovable = GamepadMovable.allGamepadMovables[0];
            this.moveTo(this.currentMovable);
            return;
        }

        if (!this.currentMovable) {
            console.log('no movables');
            return;
        }
        // const nextMovable 을 찾아야 해
        const nextMovable = this.findBelowGamepadMovable(this.currentMovable);
        if (!nextMovable) {
            console.log('cannot move down because im in last element');
            return;
        }

        this.currentMovable = nextMovable;
        this.moveTo(this.currentMovable);
        return;
    }
    private isDescendantOf(target: HTMLElement, container: HTMLElement): boolean {
        if (!target.parentElement) {
            return false;
        }
        if (target.parentElement === container) {
            return true;
        }
        return this.isDescendantOf(target.parentElement, container);
    }
    private findMovablesInFirstSameContainer(
        targetMovable: GamepadMovable,
        movables: GamepadMovable[],
    ): GamepadMovable[] | null {
        let container = targetMovable.$refs.container.parentElement;
        while (container) {
            const movablesInSameContainer = movables.filter((movable) =>
                this.isDescendantOf(movable.$refs.container, container as HTMLElement));
            if (movablesInSameContainer.length) {
                return movablesInSameContainer;
            }
            container = container.parentElement;
        }

        return null;
    }

    private findBelowGamepadMovable(targetMovable: GamepadMovable): GamepadMovable | null {
        GamepadMovable.calcMap();
        const movablesOfBottom = GamepadMovable.allGamepadMovables.filter(movable => {
            return movable.top >= targetMovable.top + targetMovable.height;
        });

        const movablesInSameFirstContainer = this.findMovablesInFirstSameContainer(targetMovable, movablesOfBottom);
        if (!movablesInSameFirstContainer) {
            // 이런 경우는 movablesOfBottom가 비어있는 경우 말곤 없을텐데?
            if (movablesOfBottom.length) {
                throw new Error('cannot find movablesInSameFirstContainer but movables of bottom exist!');
            }
            return null;
        }

        const middle = (targetMovable.left + targetMovable.width) / 2;
        const sortedByTop = movablesInSameFirstContainer.sort((a, b) => {
            return a.top - b.top;
        });

        const nextMovable = sortedByTop.find((movable) =>
            movable.left + movable.width >= targetMovable.left
            && movable.left <= targetMovable.left + targetMovable.width)
            || sortedByTop[0];

        return nextMovable;
    }
}
