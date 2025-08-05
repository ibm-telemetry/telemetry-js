import 'instrumented/one'
import 'instrumented/two'

document.querySelector('#something').innerHTML = `
    <cds-button one="one" two="two" three>button3</cds-button>
`
