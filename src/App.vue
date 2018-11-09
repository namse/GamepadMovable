<template>
  <div id="app">
    <GamepadMovable>123</GamepadMovable>
    <GamepadMovable>123</GamepadMovable>
    <div class="scroll">
      <div class="content">
        <GamepadMovable>123</GamepadMovable>
        <GamepadMovable>123</GamepadMovable>
      </div>
      <GamepadMovable>123</GamepadMovable>
      <GamepadMovable>123</GamepadMovable>
      <div class="scroll">
        <GamepadMovable>123</GamepadMovable>
        <GamepadMovable>123</GamepadMovable>
        <div class="content">
          <GamepadMovable>123</GamepadMovable>
          <GamepadMovable>123</GamepadMovable>
        </div>
      </div>
    </div>
    <div class="content">
      <GamepadMovable>123</GamepadMovable>
      <GamepadMovable>123</GamepadMovable>
    </div>
    <GamepadMovable>123</GamepadMovable>
    <GamepadMovable>123</GamepadMovable>
    <button @click="calcMap()">calcMap</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import HelloWorld from './components/HelloWorld.vue';
import GamepadMovable from './components/GamepadMovable.vue';
import GamepadMover from './components/GamepadMover'

@Component({
  components: {
    HelloWorld,
    GamepadMovable,
  },
})
export default class App extends Vue {
  gamepadMover: GamepadMover = new GamepadMover();
  calcMap() {
    GamepadMovable.calcMap();
  }
  mounted() {
    this.gamepadMover.activate();
  }
  beforeDestroy() {
    this.gamepadMover.deactivate();
  }
}
</script>

<style>
.scroll {
    height: 250px;
    width: 250px;
    overflow: auto;
}
.content {
    height: 800px;
    width: 2000px;
    background-color: coral;
}
</style>
