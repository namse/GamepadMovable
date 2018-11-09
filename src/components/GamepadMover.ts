import GamepadEventListener from './GamepadEventListener';
import { GamepadButtonEventType, GamepadButtonName } from './GamepadManager';
import GamepadMovable from './GamepadMovable';

export enum Direction {
    Up,
    Down,
    Left,
    Right,
}

export default class GamepadMover {
    private gamepadEventListener: GamepadEventListener = new GamepadEventListener;
    private prevMovable: GamepadMovable | undefined;
    private currentMovable: GamepadMovable | undefined;
    public activate() {
        this.gamepadEventListener.onEventType(GamepadButtonEventType.ButtonDown, (event) => {
            switch (event.gamepadButtonName) {
                case GamepadButtonName.Up:
                    this.move(Direction.Up);
                    return;
                case GamepadButtonName.Right:
                    this.move(Direction.Right);
                    return;
                case GamepadButtonName.Down:
                    this.move(Direction.Down);
                    return;
                case GamepadButtonName.Left:
                    this.move(Direction.Left);
                    return;
                default:
                    return;
            }
        });
    }
    public deactivate() {
        this.gamepadEventListener.destroy();
    }
    private moveTo(movable: GamepadMovable) { // 이름 바꿔줘. 헷갈려
        if (this.prevMovable) {
            this.prevMovable.onLeave();
        }
        this.scrollTo(movable);
        movable.onEnter();
        this.prevMovable = movable;
    }
    private move(direction: Direction) {
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
        const nextMovable = this.findNextGamepadMovable(this.currentMovable, direction);
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

    private findNextGamepadMovable(targetMovable: GamepadMovable, direction: Direction): GamepadMovable | null {
        GamepadMovable.calcMap();
        const movablesOverDirection = GamepadMovable.allGamepadMovables.filter(movable => {
            switch (direction) {
                case Direction.Up:
                    return movable.top + movable.height <= targetMovable.top;
                case Direction.Right:
                    return movable.left >= targetMovable.left + targetMovable.width;
                case Direction.Down:
                    return movable.top >= targetMovable.top + targetMovable.height;
                case Direction.Left:
                    return movable.left + movable.width <= targetMovable.left;
                default:
                    throw new Error(`wrong direction ${direction}`);
            }
        });

        const movablesInSameFirstContainer = this.findMovablesInFirstSameContainer(targetMovable, movablesOverDirection);
        if (!movablesInSameFirstContainer) {
            // 이런 경우는 movablesOfBottom가 비어있는 경우 말곤 없을텐데?
            if (movablesOverDirection.length) {
                throw new Error('cannot find movablesInSameFirstContainer but movables of bottom exist!');
            }
            return null;
        }

        const sortedByDirection = movablesInSameFirstContainer.sort((a, b) => {
            switch (direction) {
                case Direction.Up:
                    return b.top - a.top;
                case Direction.Right:
                    return a.left - b.left;
                case Direction.Down:
                    return a.top - b.top;
                case Direction.Left:
                    return b.left - a.left;
                default:
                    throw new Error(`wrong direction ${direction}`);
            }
        });

        const nextMovable = sortedByDirection.find((movable) => {
            switch (direction) {
                case Direction.Up:
                case Direction.Down:
                    return movable.left + movable.width >= targetMovable.left
                        && movable.left <= targetMovable.left + targetMovable.width;
                case Direction.Right:
                case Direction.Left:
                    return movable.top + movable.height >= targetMovable.top
                        && movable.top <= targetMovable.top + targetMovable.height;
                default:
                    throw new Error(`wrong direction ${direction}`);
            }
        }) || sortedByDirection[0];

        return nextMovable;
    }

    private findScrollableParent(target: HTMLElement): HTMLElement | null {
        const { parentElement } = target;
        if (!parentElement) {
            return null;
        }
        if (parentElement.scrollHeight !== parentElement.offsetHeight) {
            return parentElement;
        }
        return this.findScrollableParent(parentElement);
    }

    private scrollTo(targetMovable: GamepadMovable) {
        const { container } = targetMovable.$refs;
        const { top } = container.getBoundingClientRect();

        let scrollableParent = this.findScrollableParent(container);

        while (scrollableParent) {
            const {
                top: parentTop,
                height: parentHeight,
            } = scrollableParent.getBoundingClientRect();

            const nextScrollTop = scrollableParent.scrollTop - (parentTop + (parentHeight / 2) - top);
            console.log(nextScrollTop);

            scrollableParent.scrollTop = nextScrollTop;
            scrollableParent = this.findScrollableParent(scrollableParent);
        }
    }
}
