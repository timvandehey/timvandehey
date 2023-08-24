const functionMapper = new Map()

function on(type, fn) {
    const id = `${type}__${Date.now()}__${Math.floor(Math.random() * 1000)}`
    functionMapper.set(id, { type, fn })
    window.addEventListener(type, fn)
    return unregister.bind(this, id)
}

function unregister(id) {
    if (functionMapper.has(id)) {
        const { type, fn } = functionMapper.get(id)
        window.removeEventListener(type, fn)
        functionMapper.delete(id)
    }
}

function emit(type, detail) {
    window.dispatchEvent(new CustomEvent(type, { detail }))
    return null
}

function unregisterAll(filter = () => true) {
    for (let [id, data] of functionMapper) {
        if (filter(data)) {
            window.removeEventListener(data.type, data.fn)
            functionMapper.delete(id)
        }
    }
}

export default { emit, on, unregisterAll }
// import { itemClicked } from "./items.js";

// export const eventTypes = {
//   click: { types: ["click", "pointerUp"], plugin: click_handler },
//   input: { types: ["input"] },
// }

// function executeHandler(fn, e) { fn(e) }

// function click_handler(e, fn) {
//   executeHandler(fn, e)
// }

// export const handlers = {
//   click: generalClick,
// }

// function generalClick(e) {
//   // itemClicked(e)
//   resetTimer({ type: 'click' })
// }

// export function addEventListener(el, eventType, fn) {
//   const { types, plugin } = eventType;
//   const listenerFunction = plugin ? (e) => plugin(e, fn) : (e) => fn(e)
//   types.forEach(
//     (type) => {
//       el.addEventListener(type, listenerFunction)
//     });
// }
