import event from './events.js'

const logEvent = 'v:log'
const loggingEvent = "v:logging"

export const logger = loggerFactory()
export const log = logger.log

defineLoggingWebComponents()

logger.logging = true
logger.trace = false

event.on(logEvent,
    ({ detail }) => {
        console.log.apply(null, detail)
    }
)

function loggerFactory() {
    let _trace = false
    let _logging = false
    function log(...args) {
        if (_logging) {
            if (_trace) {
                let traceOutput
                try { throw new Error() }
                catch (e) {
                    traceOutput = ['Trace:', ...e.stack.split('\n    ').slice(2)]
                        .map(item => item.replace(window.location.origin, ''))
                }
                args.push(traceOutput)
            }
            event.emit(logEvent, args)
        }
    }
    return {
        log
        , get trace() { return _trace }
        , set trace(b) {
            _trace = !!b
            event.emit(loggingEvent)
        }
        , get logging() { return _logging }
        , set logging(b) {
            _logging = !!b
            event.emit(loggingEvent)
        }
    }
}

function defineLoggingWebComponents() {
    customElements.define(
        "v-log",
        class VLog extends HTMLElement {
            constructor() {
                super();
                event.on(logEvent, this.updateLog.bind(this))
                this.attachShadow({ mode: "open" })
            }
            connectedCallback() {
                this.shadowRoot.innerHTML = `
        <style>
        :host {
        }
        .summary {
          margin: 2px;
          background-color: var(--color,azure);
        }

        button {
          border-radius: 4px;
          border: 1px blue solid;
        }
        
        button::before {
          content: "+";
        }

        button[open]::before {
          content: "-";
        }

        pre, p {
          margin:0;
          padding:0;
        }

        ul {
          margin-top: 0;
        }

        </style>
        ${this.innerHTML}
        <pre>
          <ul></ul>
        </pre>
        `;
                this.ul = this.shadowRoot.querySelector("ul");
            }

            updateLog(e) {
                let { detail } = e
                let li = document.createElement("li");
                let last = detail.length - 1
                detail.forEach((a, i) => {
                    if (typeof a == 'object') {
                        let wrapper = document.createElement('p')
                        let btn = document.createElement('button')
                        btn.innerHTML = ""
                        let summ = document.createElement('span')
                        summ.classList.add('summary')
                        btn.classList.add('summary')
                        let det = document.createElement('p')
                        det.setAttribute('hidden', true)
                        det.innerHTML = JSON.stringify(a, null, 2)
                        summ.innerHTML = JSON.stringify(a)
                        summ.classList.add('loggerSummary')
                        btn.onclick = () => {
                            det.toggleAttribute('hidden')
                            btn.toggleAttribute('open')
                        }
                        wrapper.append(btn)
                        wrapper.append(summ)
                        wrapper.append(det)
                        li.append(wrapper)
                    } else {
                        let comma = i == last ? '' : ', '
                        li.innerHTML += `${a}${comma}`;
                    }
                });
                //   li.append(pre)
                this.ul.append(li)
            }
        }
    );


    customElements.define(
        "v-toggle-logging",
        class VToggleLogging extends HTMLElement {
            constructor() {
                super();
                //   this.attachShadow({ mode: "open" })
                //   this.br = document.createElement("br");
                //   this.ul = null;
                this.innerHTML = `
        <button></button>
        `
                this.btn = this.querySelector('button')
                event.on(loggingEvent, this.updateButton.bind(this))
                this.btn.addEventListener('click', this.btnClicked.bind(this))
                this.updateButton()
            }

            btnClicked(e) {
                logger.logging = !logger.logging
            }

            updateButton() {
                this.btn.innerHTML = logger.logging
                    ? 'Turn Logging Off'
                    : "Turn Logging On"
            }

        }
    )

    customElements.define(
        "v-toggle-trace",
        class VToggleTrace extends HTMLElement {
            constructor() {
                super();
                this.innerHTML = `
        <button></button>
        `
                this.btn = this.querySelector('button')
                event.on(loggingEvent, this.updateButton.bind(this))
                this.btn.addEventListener('click', this.btnClicked.bind(this))
                this.updateButton()
            }

            btnClicked(e) {
                logger.trace = !logger.trace
            }

            updateButton() {
                this.btn.innerHTML = logger.trace
                    ? 'Turn Trace Off'
                    : "Turn Trace On"
            }
        }
    )
}