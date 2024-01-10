import PrimeVue from 'primevue/config'

// #region Primevue Components
// #region FORM
import AutoComplete from 'primevue/autocomplete';
import Calendar from 'primevue/calendar';
import CascadeSelect from 'primevue/cascadeselect';
import Checkbox from 'primevue/checkbox';
import Chips from 'primevue/chips';
import ColorPicker from 'primevue/colorpicker';
import Dropdown from 'primevue/dropdown';
import Editor from 'primevue/editor';
import InputMask from 'primevue/inputmask';
import InputNumber from 'primevue/inputnumber';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Knob from 'primevue/knob';
import Listbox from 'primevue/listbox';
import MultiSelect from 'primevue/multiselect';
import Password from 'primevue/password';
import RadioButton from 'primevue/radiobutton';
import Rating from 'primevue/rating';
import SelectButton from 'primevue/selectbutton';
import Slider from 'primevue/slider';
import Textarea from 'primevue/textarea';
import ToggleButton from 'primevue/togglebutton';
import TreeSelect from 'primevue/treeselect';
import TriStateCheckbox from 'primevue/tristatecheckbox';
// #endregion FORM

// #region BUTTONS
import Button from 'primevue/button';
import SpeedDial from 'primevue/speeddial';
import SplitButton from 'primevue/splitbutton';
// #endregion BUTTONS

// #region DATA
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import Row from 'primevue/row';
import DataView from 'primevue/dataview';
import DataViewLayoutOptions from 'primevue/dataviewlayoutoptions';
import OrderList from 'primevue/orderlist';
import OrganizationChart from 'primevue/organizationchart';
import Paginator from 'primevue/paginator';
import PickList from 'primevue/picklist';
import Tree from 'primevue/tree';
import TreeTable from 'primevue/treetable';
import Timeline from 'primevue/timeline';
import VirtualScroller from 'primevue/virtualscroller';
// #endregion DATA

// #region PANEL
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Card from 'primevue/card';
import DeferredContent from 'primevue/deferredcontent';
import Divider from 'primevue/divider';
import Fieldset from 'primevue/fieldset';
import Panel from 'primevue/panel';
import ScrollPanel from 'primevue/scrollpanel';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Toolbar from 'primevue/toolbar';
// #endregion PANEL

//#region OVERLAY
import ConfirmationService from 'primevue/confirmationservice';
import ConfirmDialog from 'primevue/confirmdialog';
import ConfirmPopup from 'primevue/confirmpopup';
import Dialog from 'primevue/dialog';
import DialogService from 'primevue/dialogservice';
import DynamicDialog from 'primevue/dynamicdialog';
import OverlayPanel from 'primevue/overlaypanel';
import Sidebar from 'primevue/sidebar';
import Tooltip from 'primevue/tooltip';
//#endregion OVERLAY

// #region FILE
import FileUpload from 'primevue/fileupload';
// #endregion FILE

// #region MENU
import Breadcrumb from 'primevue/breadcrumb';
import ContextMenu from 'primevue/contextmenu';
import Dock from 'primevue/dock';
import Menu from 'primevue/menu';
import Menubar from 'primevue/menubar';
import MegaMenu from 'primevue/megamenu';
import PanelMenu from 'primevue/panelmenu';
import Steps from 'primevue/steps';
import TabMenu from 'primevue/tabmenu';
import TieredMenu from 'primevue/tieredmenu';
// #endregion MENU

// #region MESSAGES
import Message from 'primevue/message';
import InlineMessage from 'primevue/inlinemessage';
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';
// #endregion MESSAGES

// #region MIDIA
import Carousel from 'primevue/carousel';
import Galleria from 'primevue/galleria';
import Image from 'primevue/image';
// #endregion MIDIA

// #region MISC
import Avatar from 'primevue/avatar';
import AvatarGroup from 'primevue/avatargroup';
import Badge from 'primevue/badge';
import BadgeDirective from 'primevue/badgedirective';
import BlockUI from 'primevue/blockui';
import Chip from 'primevue/chip';
import FocusTrap from 'primevue/focustrap';
import Inplace from 'primevue/inplace';
import ScrollTop from 'primevue/scrolltop';
import Skeleton from 'primevue/skeleton';
import ProgressBar from 'primevue/progressbar';
import ProgressSpinner from 'primevue/progressspinner';
import Ripple from 'primevue/ripple';
import StyleClass from 'primevue/styleclass';
import Tag from 'primevue/tag';
import Terminal from 'primevue/terminal';
import TerminalService from 'primevue/terminalservice'
// #endregion MISC

// #endregion Primevue Components

const pt = {
  "startsWith": "Começa com",
  "contains": "Contém",
  "notContains": "Não contém",
  "endsWith": "Termina com",
  "equals": "Igual",
  "notEquals": "Diferente",
  "noFilter": "Sem filtro",
  "filter": "Filtro",
  "lt": "Menor que",
  "lte": "Menor que ou igual a",
  "gt": "Maior que",
  "gte": "Maior que ou igual a",
  "dateIs": "Data é",
  "dateIsNot": "Data não é",
  "dateBefore": "Date é anterior",
  "dateAfter": "Data é posterior",
  "custom": "Customizado",
  "clear": "Limpar",
  "close": "Fechar",
  "apply": "Aplicar",
  "matchAll": "Condiderar todos",
  "matchAny": "Considerar ao menos um",
  "addRule": "Adicionar Regra",
  "removeRule": "Remover Regra",
  "accept": "Sim",
  "reject": "Não",
  "choose": "Escolha",
  "upload": "Upload",
  "cancel": "Cancelar",
  "completed": "Concluído",
  "pending": "Pendente",
  "fileSizeTypes": ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
  "dayNames": ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
  "dayNamesShort": ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  "dayNamesMin": ["Do", "Se", "Te", "Qa", "Qi", "Sx", "Sa"],
  "monthNames": ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
  "monthNamesShort": ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
  "chooseYear": "Escolha Ano",
  "chooseMonth": "Escolha Mês",
  "chooseDate": "Escolha Data",
  "prevDecade": "Década Anterior",
  "nextDecade": "Década Seguinte",
  "prevYear": "Ano Anterior",
  "nextYear": "Ano Seguinte",
  "prevMonth": "Mês Anterior",
  "nextMonth": "Mês Seguinte",
  "prevHour": "Hora Anterior",
  "nextHour": "Hora Seguinte",
  "prevMinute": "Minuto Anterior",
  "nextMinute": "Minuto Seguinte",
  "prevSecond": "Segundo Anterior",
  "nextSecond": "Segundo Seguinte",
  "am": "am",
  "pm": "pm",
  "today": "Hoje",
  "now": "Agora",
  "weekHeader": "Sem",
  "firstDayOfWeek": 0,
  "showMonthAfterYear": false,
  "dateFormat": "dd/mm/yy",
  "weak": "Fraco",
  "medium": "Médio",
  "strong": "Forte",
  "passwordPrompt": "Digite uma senha",
  "emptyFilterMessage": "Nenhum resultado encontrado",
  "searchMessage": "{0} resultados disponíveis",
  "selectionMessage": "{0} itens selecionados",
  "emptySelectionMessage": "Nenhum item selecionado",
  "emptySearchMessage": "Nenhum resultado encontrado",
  "emptyMessage": "Nenhuma opção disponível",
  "aria": {
    "trueLabel": "Verdadeiro",
    "falseLabel": "Falso",
    "nullLabel": "Não selecionado",
    "star": "1 estrela",
    "stars": "{star} estrelas",
    "selectAll": "Todos itens selecionados",
    "unselectAll": "Nenhum item selecionado",
    "close": "Fechar",
    "previous": "Anterior",
    "next": "Seguinte",
    "navigation": "Navegação",
    "scrollTop": "Rolar para Topo",
    "moveTop": "Mover para Topo",
    "moveUp": "Mover para Cima",
    "moveDown": "Mover para Baixo",
    "moveBottom": "Mover para Final",
    "moveToTarget": "Mover para Alvo",
    "moveToSource": "Mover para Fonte",
    "moveAllToTarget": "Mover Todos para Alvo",
    "moveAllToSource": "Mover Todos para Fonte",
    "pageLabel": "Página {page}",
    "firstPageLabel": "Primeira Página",
    "lastPageLabel": "Última Página",
    "nextPageLabel": "Página Seguinte",
    "previousPageLabel": "Página Anterior",
    "rowsPerPageLabel": "Linhas por página",
    "jumpToPageDropdownLabel": "Pular para Menu da Página",
    "jumpToPageInputLabel": "Pular para Campo da Página",
    "selectRow": "Linha Selecionada",
    "unselectRow": "Linha Não Selecionada",
    "expandRow": "Linha Expandida",
    "collapseRow": "Linha Recolhida",
    "showFilterMenu": "Mostrar Menu de Filtro",
    "hideFilterMenu": "Esconder Menu de Filtro",
    "filterOperator": "Operador de Filtro",
    "filterConstraint": "Restrição de Filtro",
    "editRow": "Editar Linha",
    "saveEdit": "Salvar Editar",
    "cancelEdit": "Cancelar Editar",
    "listView": "Exibição em Lista",
    "gridView": "Exibição em Grade",
    "slide": "Deslizar",
    "slideNumber": "{slideNumber}",
    "zoomImage": "Ampliar Imagem",
    "zoomIn": "Mais Zoom",
    "zoomOut": "Menos Zoom",
    "rotateRight": "Girar à Direita",
    "rotateLeft": "Girar à Esquerda"
  }
}

const PrimevuePlugin = {
  install(app, options) {
    app.use(PrimeVue, {
      unstyled: false,
      ripple: true,
      locale: pt
    });

    // #region Primevue Components
    // #region FORM
    app.component('AutoComplete', AutoComplete);
    app.component('Calendar', Calendar);
    app.component('CascadeSelect', CascadeSelect);
    app.component('Checkbox', Checkbox);
    app.component('Chips', Chips);
    app.component('ColorPicker', ColorPicker);
    app.component('Dropdown', Dropdown);
    app.component('Editor', Editor); // "import Quill from 'quill'" is required
    app.component('InputMask', InputMask);
    app.component('InputNumber', InputNumber);
    app.component('InputSwitch', InputSwitch);
    app.component('InputText', InputText);
    app.component('InputGroup', InputGroup);
    app.component('InputGroupAddon', InputGroupAddon);
    app.component('Knob', Knob);
    app.component('Listbox', Listbox);
    app.component('MultiSelect', MultiSelect);
    app.component('Password', Password);
    app.component('RadioButton', RadioButton);
    app.component('Rating', Rating);
    app.component('SelectButton', SelectButton);
    app.component('Slider', Slider);
    app.component('Textarea', Textarea);
    app.component('ToggleButton', ToggleButton);
    app.component('TreeSelect', TreeSelect);
    app.component('TriStateCheckbox', TriStateCheckbox);
    // #endregion FORM

    // #region BUTTON
    app.component('Button', Button);
    app.component('SpeedDial', SpeedDial);
    app.component('SplitButton', SplitButton);
    // #endregion BUTTON

    // #region DATA
    app.component('DataTable', DataTable);
    app.component('Column', Column);
    app.component('ColumnGroup', ColumnGroup);
    app.component('Row', Row);
    app.component('DataView', DataView);
    app.component('DataViewLayoutOptions', DataViewLayoutOptions);
    app.component('OrderList', OrderList);
    app.component('OrganizationChart', OrganizationChart);
    app.component('Paginator', Paginator);
    app.component('PickList', PickList);
    app.component('Tree', Tree);
    app.component('TreeTable', TreeTable);
    app.component('Timeline', Timeline);
    app.component('VirtualScroller', VirtualScroller);
    // #endregion DATA

    // #region PANEL
    app.component('Accordion', Accordion);
    app.component('AccordionTab', AccordionTab);
    app.component('Card', Card);
    app.component('DeferredContent', DeferredContent);
    app.component('Divider', Divider);
    app.component('Fieldset', Fieldset);
    app.component('Panel', Panel);
    app.component('ScrollPanel', ScrollPanel);
    app.component('Splitter', Splitter);
    app.component('SplitterPanel', SplitterPanel);
    app.component('TabView', TabView);
    app.component('TabPanel', TabPanel);
    app.component('Toolbar', Toolbar);
    // #endregion PANEL

    // #region OVERLAY
    app.use(ConfirmationService);
    app.component('ConfirmDialog', ConfirmDialog);
    app.component('ConfirmPopup', ConfirmPopup);
    app.component('Dialog', Dialog);
    app.use(DialogService);
    app.component('DynamicDialog', DynamicDialog);
    app.component('OverlayPanel', OverlayPanel);
    app.component('Sidebar', Sidebar);
    app.directive('tooltip', Tooltip);
    // #endregion OVERLAY

    // #region FILE
    app.component('FileUpload', FileUpload);
    // #endregion FILE

    // #region MENU
    app.component('Breadcrumb', Breadcrumb);
    app.component('ContextMenu', ContextMenu);
    app.component('Dock', Dock);
    app.component('Menu', Menu);
    app.component('Menubar', Menubar);
    app.component('MegaMenu', MegaMenu);
    app.component('PanelMenu', PanelMenu);
    app.component('Steps', Steps);
    app.component('TabMenu', TabMenu);
    app.component('TieredMenu', TieredMenu);
    // #endregion MENU

    // #region MESSAGES
    app.component('Message', Message);
    app.component('InlineMessage', InlineMessage);
    app.component('Toast', Toast);
    app.use(ToastService);
    // #endregion MESSAGES

    // #region MIDIA
    app.component('Carousel', Carousel);
    app.component('Galleria', Galleria);
    app.component('Image', Image);
    // #endregion MIDIA

    // #region MISC
    app.component('Avatar', Avatar);
    app.component('AvatarGroup', AvatarGroup);
    app.component('Badge', Badge);
    app.directive('badge', BadgeDirective);
    app.component('BlockUI', BlockUI);
    app.component('Chip', Chip);
    app.directive('focustrap', FocusTrap);
    app.component('Inplace', Inplace);
    app.component('ScrollTop', ScrollTop);
    app.component('Skeleton', Skeleton);
    app.component('ProgressBar', ProgressBar);
    app.component('ProgressSpinner', ProgressSpinner);
    app.directive('ripple', Ripple);
    app.directive('styleclass', StyleClass);
    app.component('Tag', Tag);
    app.component('Terminal', Terminal);
    app.component('TerminalService', TerminalService);
    // #endregion MISC
    // #endregion Primevue Components
  }
}

export default PrimevuePlugin;