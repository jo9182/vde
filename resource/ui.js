import "../resource/scss/ui.scss";

// Load components
let components = [
    'button', 'checkbox', 'input',
    'number.range', 'radio.group', 'select',
    'toggle.group', 'tab.panel', 'table', 'panel', 'slider', 'progress',
    'tree', 'side.bar', 'file.tree', 'field', 'chart', 'menu.bar', 'modal',
    'tab.group', 'file.table'
];

for (let i = 0; i < components.length; i++) {
    Vue.component('vde-' + components[i].replace(/\./g, '-'),
        require('../resource/component/ui/vde.' + components[i] + '.vue').default);
}

Vue.directive('draggable', {
    bind(el, binding, vnode) {
        el.style.color = 'red';
    }
});