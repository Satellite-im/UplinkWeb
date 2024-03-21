import { writable } from 'svelte/store'

export const enableRightClick = writable(true)
export function toggleRightClick() {
	console.log(enableRightClick);
	enableRightClick.update((state) => !state);
  }
  enableRightClick.subscribe(value => {
	console.log(value);
  });
export const counter = createCounter(0)

function createCounter(count: number) {
	const { subscribe, set, update } = writable(count)

	function increment() {
		update(count => count + 1)
	}

	function decrement() {
		update(count => count - 1)
	}

	function reset() {
		set(0)
	}

	return { subscribe, increment, decrement, reset }
}
