import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class GamepadMovable extends Vue {
  static allGamepadMovables: GamepadMovable[]  = [];
  $refs!: {
    container: HTMLDivElement,
  };
  top = 0;
  left = 0;
  width = 0;
  height = 0;
  static lastId = 0;
  id: number = 0;

  isSelected: boolean = false;

  mounted() {
    GamepadMovable.allGamepadMovables.push(this);
    console.log(GamepadMovable.allGamepadMovables);
    GamepadMovable.lastId += 1;
    this.id = GamepadMovable.lastId;
  }

  beforeDestroy() {
    const index = GamepadMovable.allGamepadMovables.indexOf(this);
    GamepadMovable.allGamepadMovables.splice(index, 1);
    console.log(GamepadMovable.allGamepadMovables);
  }

  onEnter() {
    this.isSelected = true;
  }

  onLeave() {
    this.isSelected = false;
  }

  static initGamepadMovableLocations() {
    GamepadMovable.allGamepadMovables.forEach(movable => {
      const rect = movable.$refs.container.getBoundingClientRect();
      movable.top = rect.top;
      movable.left = rect.left;
      movable.width = rect.width;
      movable.height = rect.height;
    });
  }

  static relocateAllGamepadMovablesByScrolls() {
    // 어떤 무버블에 대하여 부모 중에 스크롤이 있습니까?
    GamepadMovable.allGamepadMovables.forEach(movable => {
      let scrollParent = findNotCalculatedScroll(movable.$refs.container);
      while (scrollParent) {
        relocateAllGamepadMovablesByScroll(scrollParent);

        setScrollAsAlreadyCalculated(scrollParent);

        findScrollParentAndRelocateAllGamepadMovables(scrollParent);

        scrollParent = findNotCalculatedScroll(movable.$refs.container);
      }
    });
  }

  static logGamepadMovablesLocation() {
    GamepadMovable.allGamepadMovables.forEach(movable => {
      console.log(movable.left, movable.top);
    });
  }
  static calcMap() {
    this.initGamepadMovableLocations();

    this.relocateAllGamepadMovablesByScrolls();

    this.logGamepadMovablesLocation();
  }
}

function findScrollParent(element: HTMLElement): HTMLElement | null {
  const { parentElement } = element;
  if (!parentElement) {
    return null;
  }

  const hasHorizontalScroll = element.scrollWidth > element.clientWidth;
  const hasVerticalScroll = parentElement.scrollHeight > parentElement.clientHeight;
  if (hasHorizontalScroll || hasVerticalScroll) {
    return parentElement;
  }

  return findScrollParent(parentElement);
}

function isElementHasThisAsPanret(element: HTMLElement, parent: HTMLElement): boolean {
  if (!element.parentElement) {
    return false;
  }
  if (element.parentElement === parent) {
    return true;
  }
  return isElementHasThisAsPanret(element.parentElement, parent);
}

const alreadyCalculatedScrolls: HTMLElement[] = [];

function findNotCalculatedScroll(element: HTMLElement): HTMLElement | null {
  const scrollParent = findScrollParent(element);
  if (!scrollParent) {
    return null;
  }

  // 그 스크롤은 이미 계산된 스크롤입니까?
  if (alreadyCalculatedScrolls.includes(scrollParent)) {
    return findNotCalculatedScroll(scrollParent);
  }

  return scrollParent;
}

function relocateAllGamepadMovablesByScroll(scrollElement: HTMLElement) {
  // 그 스크롤에 포함되는 모든 무버블의 위치를 스크롤에 맞게 업데이트합니다.
  const movablesInScroll: GamepadMovable[] = GamepadMovable.allGamepadMovables.filter(movable =>
    isElementHasThisAsPanret(movable.$refs.container, scrollElement));
  movablesInScroll.forEach((movable) => {
    movable.left += scrollElement.scrollLeft;
    movable.top += scrollElement.scrollTop;
  });

  // 그 스크롤에 포함되지 않지만 스크롤의 아래에 존재하는 모든 무버블의 위치를 업데이트합니다.
  const movablesNotScrollsChild: GamepadMovable[] = GamepadMovable.allGamepadMovables.filter(movable =>
    !isElementHasThisAsPanret(movable.$refs.container, scrollElement));

    const movablesOnBottomOfScroll: GamepadMovable[] = movablesNotScrollsChild.filter(movable =>
    scrollElement.getBoundingClientRect().bottom <= movable.$refs.container.getBoundingClientRect().top
  );
  const movablesOnRightOfcroll: GamepadMovable[] = movablesNotScrollsChild.filter(movable =>
    scrollElement.getBoundingClientRect().right <= movable.$refs.container.getBoundingClientRect().left
  );

  movablesOnBottomOfScroll.forEach((movable) => {
    movable.top += scrollElement.scrollHeight;
  });
  movablesOnRightOfcroll.forEach((movable) => {
    movable.left += scrollElement.scrollWidth;
  });
}

function findScrollParentAndRelocateAllGamepadMovables(element: HTMLElement) {
  const scrollParent = findNotCalculatedScroll(element);
  if (!scrollParent) {
    return;
  }

  relocateAllGamepadMovablesByScroll(scrollParent);

  alreadyCalculatedScrolls.push(scrollParent);

  findScrollParentAndRelocateAllGamepadMovables(scrollParent);
}

function setScrollAsAlreadyCalculated(scroll: HTMLElement) {
  alreadyCalculatedScrolls.push(scroll);
}

