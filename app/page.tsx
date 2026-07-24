"use client";

import { useMemo, useState } from "react";

type Section = "Главная" | "Счета" | "Заявки" | "Доставки" | "Платежи" | "Проекты" | "Контрагенты" | "Бюджет";
type Invoice = {
  id: string;
  number: string;
  supplier: string;
  project: string;
  category: string;
  amount: number;
  approval: "Черновик" | "На согласовании" | "Согласован" | "Отклонён";
  payment: "Не запланирован" | "Запланирован" | "Принят к оплате" | "Частично оплачен" | "Оплачен";
  delivery: "Не запланирована" | "Запланирована" | "Частично доставлен" | "Полностью доставлен";
  due: string;
  request: string;
  owner: string;
};

const money = (value: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value) + " ₽";

const initialInvoices: Invoice[] = [
  { id: "СЧ-0248", number: "1348 от 22.07", supplier: "ООО «Монолит Ресурс»", project: "Резиденция Сосны", category: "Монолитные работы", amount: 1248000, approval: "На согласовании", payment: "Не запланирован", delivery: "Не запланирована", due: "Сегодня, 16:00", request: "ЗА-0186, ЗА-0189", owner: "Илья Морозов" },
  { id: "СЧ-0247", number: "77/К от 21.07", supplier: "АО «Керама Центр»", project: "Клубный дом Маяк", category: "Отделочные материалы", amount: 684500, approval: "Согласован", payment: "Принят к оплате", delivery: "Запланирована", due: "25 июл", request: "ЗА-0182", owner: "Анна Лебедева" },
  { id: "СЧ-0246", number: "812 от 20.07", supplier: "ВентПрофи", project: "Резиденция Сосны", category: "Вентиляция", amount: 392800, approval: "Согласован", payment: "Оплачен", delivery: "Частично доставлен", due: "24 июл", request: "ЗА-0179", owner: "Илья Морозов" },
  { id: "СЧ-0245", number: "0407-18 от 18.07", supplier: "Северный свет", project: "БЦ Архитектор", category: "Электрика", amount: 218900, approval: "Черновик", payment: "Не запланирован", delivery: "Не запланирована", due: "26 июл", request: "ЗА-0174", owner: "Максим Волков" },
  { id: "СЧ-0244", number: "159 от 17.07", supplier: "ТК «Горизонт»", project: "Клубный дом Маяк", category: "Логистика", amount: 96500, approval: "Согласован", payment: "Оплачен", delivery: "Полностью доставлен", due: "Закрыт", request: "ЗА-0168", owner: "Анна Лебедева" },
];

const projects = [
  { name: "Резиденция Сосны", address: "МО, Одинцовский г.о.", manager: "Илья Морозов", plan: 48600000, committed: 35480000, paid: 28740000, requests: 28 },
  { name: "Клубный дом Маяк", address: "Москва, Береговой пр-д, 3", manager: "Анна Лебедева", plan: 32200000, committed: 24780000, paid: 19450000, requests: 19 },
  { name: "БЦ Архитектор", address: "Москва, ул. Правды, 24", manager: "Максим Волков", plan: 18900000, committed: 17140000, paid: 12680000, requests: 12 },
];

const nav: { label: Section; icon: string; count?: number }[] = [
  { label: "Главная", icon: "⌂" }, { label: "Счета", icon: "▤", count: 7 }, { label: "Заявки", icon: "≡", count: 4 },
  { label: "Доставки", icon: "◇", count: 3 }, { label: "Платежи", icon: "₽", count: 5 }, { label: "Проекты", icon: "□" },
  { label: "Контрагенты", icon: "◎" }, { label: "Бюджет", icon: "◫" },
];

function Status({ children }: { children: string }) {
  const kind = /Согласован|Оплачен|Полностью|Закрыт|Доставлена/.test(children)
    ? "green" : /согласовании|Запланирован|Принят|Частично/.test(children)
      ? "amber" : /Отклон/.test(children) ? "red" : "gray";
  return <span className={`status ${kind}`}><i />{children}</span>;
}

function Progress({ value, danger = false }: { value: number; danger?: boolean }) {
  return <div className="progress"><span style={{ width: `${Math.min(value, 100)}%` }} className={danger ? "danger" : ""} /></div>;
}

export default function Home() {
  const [section, setSection] = useState<Section>("Главная");
  const [invoices, setInvoices] = useState(initialInvoices);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [query, setQuery] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("Все статусы");
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<"invoice" | "request" | null>(null);
  const [notifications, setNotifications] = useState(true);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const filtered = useMemo(() => invoices.filter((invoice) => {
    const haystack = `${invoice.id} ${invoice.number} ${invoice.supplier} ${invoice.project}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (approvalFilter === "Все статусы" || invoice.approval === approvalFilter);
  }), [invoices, query, approvalFilter]);

  const approveInvoice = (invoice: Invoice) => {
    const updated: Invoice = { ...invoice, approval: "Согласован" };
    setInvoices((list) => list.map((item) => item.id === invoice.id ? updated : item));
    setSelected(updated);
    showToast(`${invoice.id} согласован и доступен бухгалтерии`);
  };

  const createInvoice = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const created: Invoice = {
      id: `СЧ-0${249 + invoices.length}`, number: String(data.get("number") || "Новый"),
      supplier: String(data.get("supplier")), project: String(data.get("project")),
      category: String(data.get("category")), amount: Number(data.get("amount")),
      approval: "Черновик", payment: "Не запланирован", delivery: "Не запланирована",
      due: "Не задан", request: String(data.get("request")), owner: "Елена Соколова",
    };
    setInvoices((list) => [created, ...list]);
    setModal(null);
    setSection("Счета");
    showToast(`Черновик ${created.id} создан`);
  };

  const changeSection = (next: Section) => {
    setSection(next);
    setSelected(null);
    setQuery("");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => changeSection("Главная")} aria-label="На главную">
          <span className="brand-mark">Б</span><span><b>Бюро</b><small>строительства</small></span>
        </button>
        <div className="workspace"><small>Рабочее пространство</small><strong>Строительная компания <b>⌄</b></strong></div>
        <nav>
          {nav.map((item) => <button key={item.label} onClick={() => changeSection(item.label)} className={section === item.label ? "active" : ""}>
            <span className="nav-icon">{item.icon}</span><span>{item.label}</span>{item.count && <em>{item.count}</em>}
          </button>)}
        </nav>
        <div className="sidebar-bottom">
          <button><span className="nav-icon">⚙</span>Настройки</button>
          <div className="profile"><div className="avatar">ЕС</div><span><strong>Елена Соколова</strong><small>Руководитель проекта</small></span><b>•••</b></div>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">Б</span><b>Бюро</b></div>
          <div className="global-search"><span>⌕</span><input aria-label="Глобальный поиск" placeholder="Найти счёт, заявку, контрагента..." /></div>
          <button className="icon-button" onClick={() => { setNotifications(false); showToast("Новых уведомлений нет"); }}>♢{notifications && <i />}</button>
          <button className="help">?</button>
        </header>

        <div className="content">
          {section === "Главная" && <Dashboard setSection={changeSection} openInvoice={setSelected} invoices={invoices} openModal={setModal} />}
          {section === "Счета" && <InvoiceRegistry invoices={filtered} query={query} setQuery={setQuery} approvalFilter={approvalFilter} setApprovalFilter={setApprovalFilter} openInvoice={setSelected} openModal={() => setModal("invoice")} />}
          {section === "Проекты" && <Projects />}
          {section === "Бюджет" && <Budget />}
          {section === "Заявки" && <Requests openModal={() => setModal("request")} showToast={showToast} />}
          {section === "Доставки" && <Deliveries showToast={showToast} />}
          {section === "Платежи" && <Payments showToast={showToast} />}
          {section === "Контрагенты" && <Counterparties showToast={showToast} />}
        </div>
      </main>

      {selected && <InvoiceDrawer invoice={selected} close={() => setSelected(null)} approve={() => approveInvoice(selected)} showToast={showToast} />}
      {modal === "invoice" && <InvoiceModal close={() => setModal(null)} submit={createInvoice} />}
      {modal === "request" && <RequestModal close={() => setModal(null)} submit={() => { setModal(null); showToast("Заявка ЗА-0191 создана и сохранена в черновиках"); }} />}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div>
  );
}

function PageTitle({ eyebrow, title, copy, action }: { eyebrow?: string; title: string; copy?: string; action?: React.ReactNode }) {
  return <div className="page-title"><div>{eyebrow && <small>{eyebrow}</small>}<h1>{title}</h1>{copy && <p>{copy}</p>}</div>{action}</div>;
}

function Dashboard({ setSection, openInvoice, invoices, openModal }: { setSection: (s: Section) => void; openInvoice: (i: Invoice) => void; invoices: Invoice[]; openModal: (m: "invoice" | "request") => void }) {
  return <>
    <PageTitle eyebrow="ПЯТНИЦА, 24 ИЮЛЯ" title="Добрый день, Елена" copy="Сегодня 7 задач требуют вашего внимания." action={<div className="title-actions"><button className="secondary" onClick={() => openModal("request")}>＋ Новая заявка</button><button className="primary" onClick={() => openModal("invoice")}>＋ Новый счёт</button></div>} />
    <section className="attention">
      <div className="section-head"><div><small>ТРЕБУЕТ ВНИМАНИЯ</small><h2>Рабочая очередь</h2></div><button onClick={() => setSection("Счета")}>Все задачи →</button></div>
      <div className="queue-grid">
        <button className="queue-card hot" onClick={() => openInvoice(invoices[0])}><span className="queue-icon">⌁</span><div><strong>3</strong><p>Счета на согласование</p><small>1 превышает лимит статьи</small></div><b>→</b></button>
        <button className="queue-card" onClick={() => setSection("Платежи")}><span className="queue-icon">₽</span><div><strong>2</strong><p>Платежа на сегодня</p><small>На сумму 1 105 300 ₽</small></div><b>→</b></button>
        <button className="queue-card" onClick={() => setSection("Доставки")}><span className="queue-icon">◇</span><div><strong>2</strong><p>Доставки ожидаются</p><small>Ближайшая в 14:30</small></div><b>→</b></button>
        <button className="queue-card" onClick={() => setSection("Заявки")}><span className="queue-icon">≡</span><div><strong>4</strong><p>Новые заявки</p><small>Ожидают распределения</small></div><b>→</b></button>
      </div>
    </section>
    <div className="dashboard-grid">
      <section className="panel">
        <div className="section-head"><div><small>ФИНАНСЫ</small><h2>Портфель проектов</h2></div><button onClick={() => setSection("Бюджет")}>Отчёт по бюджету →</button></div>
        <div className="portfolio-summary"><div><small>ОБЩИЙ БЮДЖЕТ</small><strong>99,7 млн ₽</strong></div><div><small>ОБЯЗАТЕЛЬСТВА</small><strong>77,4 млн ₽</strong></div><div><small>ОПЛАЧЕНО</small><strong>60,9 млн ₽</strong></div></div>
        <div className="project-list">
          {projects.map((p) => <button key={p.name} onClick={() => setSection("Проекты")}><span className="project-letter">{p.name[0]}</span><span className="project-main"><strong>{p.name}</strong><small>{p.manager} · {p.requests} заявок</small><Progress value={p.committed / p.plan * 100} danger={p.committed / p.plan > .9} /></span><span className="project-money"><strong>{money(p.committed)}</strong><small>из {money(p.plan)}</small></span></button>)}
        </div>
      </section>
      <section className="panel activity">
        <div className="section-head"><div><small>ЛЕНТА</small><h2>Последние события</h2></div><button>Вся история →</button></div>
        {[
          ["АЛ", "Анна Лебедева", "согласовала счёт СЧ-0247", "10 минут назад"],
          ["ДК", "Дмитрий Котов", "принял доставку по СЧ-0246", "36 минут назад"],
          ["ОВ", "Ольга Воронина", "провела платёж на 392 800 ₽", "1 час назад"],
          ["ИМ", "Илья Морозов", "создал заявку ЗА-0190", "2 часа назад"],
        ].map((item, i) => <div className="activity-row" key={item[3]}><div className={`avatar c${i}`}>{item[0]}</div><p><strong>{item[1]}</strong> {item[2]}<small>{item[3]}</small></p></div>)}
      </section>
    </div>
  </>;
}

function InvoiceRegistry({ invoices, query, setQuery, approvalFilter, setApprovalFilter, openInvoice, openModal }: { invoices: Invoice[]; query: string; setQuery: (v: string) => void; approvalFilter: string; setApprovalFilter: (v: string) => void; openInvoice: (i: Invoice) => void; openModal: () => void }) {
  return <>
    <PageTitle eyebrow="ЗАКУПКИ" title="Счета" copy={`${invoices.length} записей в текущей выборке`} action={<button className="primary" onClick={openModal}>＋ Новый счёт</button>} />
    <section className="registry">
      <div className="filters"><label className="table-search">⌕<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Номер, поставщик, проект..." /></label><select value={approvalFilter} onChange={(e) => setApprovalFilter(e.target.value)}><option>Все статусы</option><option>Черновик</option><option>На согласовании</option><option>Согласован</option><option>Отклонён</option></select><select><option>Все проекты</option>{projects.map((p) => <option key={p.name}>{p.name}</option>)}</select><button className="filter-button">≡ Фильтры</button><button className="export">⇩ Экспорт</button></div>
      <div className="table-wrap"><table><thead><tr><th>Счёт</th><th>Поставщик / проект</th><th>Сумма</th><th>Согласование</th><th>Оплата</th><th>Доставка</th><th>Срок</th></tr></thead><tbody>
        {invoices.map((invoice) => <tr key={invoice.id} onClick={() => openInvoice(invoice)}><td><strong>{invoice.id}</strong><small>{invoice.number}</small></td><td><strong>{invoice.supplier}</strong><small>{invoice.project}</small></td><td><strong>{money(invoice.amount)}</strong><small>{invoice.category}</small></td><td><Status>{invoice.approval}</Status></td><td><Status>{invoice.payment}</Status></td><td><Status>{invoice.delivery}</Status></td><td><strong>{invoice.due}</strong><small>{invoice.owner}</small></td></tr>)}
      </tbody></table>{invoices.length === 0 && <div className="empty">Ничего не найдено. Измените запрос или фильтр.</div>}</div>
    </section>
  </>;
}

function Projects() {
  return <><PageTitle eyebrow="ПОРТФЕЛЬ" title="Проекты" copy="Финансовое состояние и снабжение объектов" action={<button className="primary">＋ Новый проект</button>} /><div className="project-cards">{projects.map((p, i) => {
    const percent = Math.round(p.committed / p.plan * 100); return <article key={p.name}><div className="project-cover"><span>0{i + 1}</span><small>{i === 2 ? "ЗАВЕРШЕНИЕ" : "В РАБОТЕ"}</small></div><div className="project-card-body"><h2>{p.name}</h2><p>{p.address}</p><div className="project-stats"><span><small>Бюджет</small><b>{money(p.plan)}</b></span><span><small>Обязательства</small><b>{percent}%</b></span><span><small>Оплачено</small><b>{money(p.paid)}</b></span></div><Progress value={percent} danger={percent > 90} /><footer><span className="avatar">ИМ</span><b>{p.manager}</b><button>Открыть проект →</button></footer></div></article>;
  })}</div></>;
}

function Budget() {
  const items = [
    ["Монолитные работы", 18200000, 16780000, 14500000], ["Инженерные системы", 12400000, 9850000, 7420000],
    ["Отделочные материалы", 9600000, 8240000, 6180000], ["Электрика", 5200000, 5510000, 4280000], ["Логистика", 3200000, 2450000, 2360000],
  ];
  return <><PageTitle eyebrow="ПЛАН — ФАКТ" title="Бюджет" copy="Резиденция Сосны · актуально на 24 июля" action={<><button className="secondary">⇩ Excel</button><button className="primary">＋ Статья</button></>} />
    <div className="budget-kpis"><article><small>ЛИМИТ ПРОЕКТА</small><b>48,6 млн ₽</b><p>Утверждённый бюджет</p></article><article><small>ОБЯЗАТЕЛЬСТВА</small><b>35,5 млн ₽</b><p className="positive">73% от лимита</p></article><article><small>ОПЛАЧЕНО</small><b>28,7 млн ₽</b><p>59% от лимита</p></article><article className="warning"><small>ПЕРЕРАСХОД</small><b>310 000 ₽</b><p>1 статья выше лимита</p></article></div>
    <section className="registry budget-table"><div className="section-head"><div><small>СТАТЬИ ЗАТРАТ</small><h2>Исполнение бюджета</h2></div></div><div className="table-wrap"><table><thead><tr><th>Статья</th><th>Лимит</th><th>Обязательства</th><th>Оплачено</th><th>Остаток</th><th>Исполнение</th></tr></thead><tbody>{items.map((item) => { const over = item[2] > item[1]; return <tr key={String(item[0])}><td><strong>{item[0]}</strong></td><td>{money(Number(item[1]))}</td><td><strong>{money(Number(item[2]))}</strong></td><td>{money(Number(item[3]))}</td><td className={over ? "negative" : ""}>{money(Number(item[1]) - Number(item[2]))}</td><td><b>{Math.round(Number(item[2]) / Number(item[1]) * 100)}%</b><Progress value={Number(item[2]) / Number(item[1]) * 100} danger={over} /></td></tr>})}</tbody></table></div></section>
  </>;
}

function Requests({ openModal, showToast }: { openModal: () => void; showToast: (s: string) => void }) {
  const rows = [["ЗА-0190", "Арматура А500С, 14 т", "Резиденция Сосны", "Сегодня", "На утверждении"], ["ЗА-0189", "Бетон B30, 120 м³", "Резиденция Сосны", "25 июл", "В работе"], ["ЗА-0188", "Керамогранит, 480 м²", "Клубный дом Маяк", "28 июл", "В работе"], ["ЗА-0187", "Кабель ВВГнг, 2 400 м", "БЦ Архитектор", "30 июл", "Черновик"]];
  return <SimpleRegistry eyebrow="СНАБЖЕНИЕ" title="Заявки" copy="Потребности строительных площадок" action={<button className="primary" onClick={openModal}>＋ Новая заявка</button>} headings={["Заявка", "Потребность", "Проект", "Нужно к", "Статус"]} rows={rows} showToast={showToast} />;
}
function Deliveries({ showToast }: { showToast: (s: string) => void }) {
  const rows = [["ДО-0084", "СЧ-0247 · АО «Керама Центр»", "Клубный дом Маяк", "25 июл, 14:30", "Запланирована"], ["ДО-0083", "СЧ-0246 · ВентПрофи", "Резиденция Сосны", "Сегодня, 16:00", "Частично доставлена"], ["ДО-0082", "СЧ-0244 · ТК «Горизонт»", "Клубный дом Маяк", "22 июл", "Доставлена"]];
  return <SimpleRegistry eyebrow="ЛОГИСТИКА" title="Доставки" copy="Планирование и приёмка на объектах" action={<button className="primary" onClick={() => showToast("Выберите согласованный счёт для новой доставки")}>＋ Доставка</button>} headings={["Доставка", "Счёт / поставщик", "Проект", "Дата и время", "Статус"]} rows={rows} showToast={showToast} />;
}
function Payments({ showToast }: { showToast: (s: string) => void }) {
  const rows = [["ПЛ-0119", "СЧ-0247 · АО «Керама Центр»", "Клубный дом Маяк", "684 500 ₽", "Принят к оплате"], ["ПЛ-0118", "СЧ-0246 · ВентПрофи", "Резиденция Сосны", "392 800 ₽", "Оплачен"], ["ПЛ-0117", "СЧ-0244 · ТК «Горизонт»", "Клубный дом Маяк", "96 500 ₽", "Оплачен"]];
  return <SimpleRegistry eyebrow="ФИНАНСЫ" title="Платежи" copy="Оплата только по согласованным счетам" action={<button className="primary" onClick={() => showToast("Создание платежа доступно из карточки согласованного счёта")}>＋ Платёж</button>} headings={["Платёж", "Основание", "Проект", "Сумма", "Статус"]} rows={rows} showToast={showToast} />;
}
function Counterparties({ showToast }: { showToast: (s: string) => void }) {
  const rows = [["КН-0062", "ООО «Монолит Ресурс»", "Поставщик", "7703418290", "Активен"], ["КН-0058", "АО «Керама Центр»", "Поставщик · перевозчик", "7731548271", "Активен"], ["КН-0041", "ООО «Бюро Девелопмент»", "Плательщик · заказчик", "7709823417", "Активен"], ["КН-0036", "ТК «Горизонт»", "Перевозчик", "5024186320", "Активен"]];
  return <SimpleRegistry eyebrow="СПРАВОЧНИК" title="Контрагенты" copy="Единая база поставщиков, плательщиков и перевозчиков" action={<button className="primary" onClick={() => showToast("Карточка контрагента готова к заполнению")}>＋ Контрагент</button>} headings={["ID", "Наименование", "Роли", "ИНН", "Статус"]} rows={rows} showToast={showToast} />;
}

function SimpleRegistry({ eyebrow, title, copy, action, headings, rows, showToast }: { eyebrow: string; title: string; copy: string; action: React.ReactNode; headings: string[]; rows: string[][]; showToast: (s: string) => void }) {
  const [filter, setFilter] = useState("");
  const visible = rows.filter((r) => r.join(" ").toLowerCase().includes(filter.toLowerCase()));
  return <><PageTitle eyebrow={eyebrow} title={title} copy={copy} action={action} /><section className="registry"><div className="filters"><label className="table-search">⌕<input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Поиск по реестру..." /></label><select><option>Все проекты</option>{projects.map(p => <option key={p.name}>{p.name}</option>)}</select><button className="filter-button">≡ Фильтры</button><button className="export" onClick={() => showToast("Реестр подготовлен к экспорту в Excel")}>⇩ Экспорт</button></div><div className="table-wrap"><table><thead><tr>{headings.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{visible.map((r) => <tr key={r[0]} onClick={() => showToast(`Открыта карточка ${r[0]}`)}>{r.map((c, i) => <td key={c}>{i === 0 || i === 1 ? <strong>{c}</strong> : i === r.length - 1 ? <Status>{c}</Status> : c}</td>)}</tr>)}</tbody></table></div></section></>;
}

function InvoiceDrawer({ invoice, close, approve, showToast }: { invoice: Invoice; close: () => void; approve: () => void; showToast: (s: string) => void }) {
  const over = invoice.id === "СЧ-0248";
  return <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}><aside className="drawer">
    <header><div><small>СЧЁТ</small><h2>{invoice.id}</h2><p>{invoice.number}</p></div><button onClick={close}>×</button></header>
    <div className="drawer-body">
      <div className="invoice-amount"><small>СУММА К ОПЛАТЕ</small><strong>{money(invoice.amount)}</strong><Status>{invoice.approval}</Status></div>
      {over && <div className="budget-alert"><b>!</b><p><strong>Превышение лимита</strong><span>После этого счёта статья превысит лимит на 310 000 ₽. Требуется согласование директора.</span></p></div>}
      <div className="detail-grid"><span><small>ПРОЕКТ</small><b>{invoice.project}</b></span><span><small>ПОСТАВЩИК</small><b>{invoice.supplier}</b></span><span><small>СТАТЬЯ БЮДЖЕТА</small><b>{invoice.category}</b></span><span><small>ЗАЯВКИ</small><b className="link">{invoice.request}</b></span></div>
      <h3>Статусы процесса</h3><div className="process-status"><span><small>Согласование</small><Status>{invoice.approval}</Status></span><span><small>Оплата</small><Status>{invoice.payment}</Status></span><span><small>Доставка</small><Status>{invoice.delivery}</Status></span></div>
      <h3>История действий</h3><div className="timeline"><div><i /><p><b>Счёт отправлен на согласование</b><small>Илья Морозов · сегодня, 11:42</small></p></div><div><i /><p><b>Проверен сметчиком</b><small>Лимит статьи превышен · сегодня, 10:18</small></p></div><div><i /><p><b>Черновик счёта создан</b><small>{invoice.owner} · вчера, 17:06</small></p></div></div>
    </div>
    <footer>{invoice.approval === "На согласовании" ? <><button className="reject" onClick={() => showToast("Счёт возвращён снабженцу на доработку")}>Вернуть</button><button className="primary" onClick={approve}>Согласовать счёт</button></> : invoice.approval === "Согласован" ? <button className="primary wide" onClick={() => showToast("Счёт передан бухгалтеру в оплату")}>Передать в оплату</button> : <button className="primary wide" onClick={() => showToast("Счёт отправлен на согласование")}>Отправить на согласование</button>}</footer>
  </aside></div>;
}

function InvoiceModal({ close, submit }: { close: () => void; submit: (e: React.FormEvent<HTMLFormElement>) => void }) {
  return <Modal title="Новый счёт" subtitle="Создайте черновик — согласование можно запустить позже" close={close}><form onSubmit={submit}><div className="form-grid"><label><span>Проект *</span><select name="project" required>{projects.map(p => <option key={p.name}>{p.name}</option>)}</select></label><label><span>Связанная заявка *</span><select name="request" required><option>ЗА-0190</option><option>ЗА-0189</option><option>ЗА-0188</option></select></label><label className="full"><span>Поставщик *</span><select name="supplier" required><option>ООО «Монолит Ресурс»</option><option>АО «Керама Центр»</option><option>ВентПрофи</option></select></label><label><span>Номер и дата счёта *</span><input name="number" placeholder="142 от 24.07" required /></label><label><span>Сумма, ₽ *</span><input name="amount" type="number" placeholder="0" min="1" required /></label><label className="full"><span>Статья бюджета *</span><select name="category"><option>Монолитные работы</option><option>Инженерные системы</option><option>Отделочные материалы</option><option>Электрика</option></select></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={close}>Отмена</button><button className="primary">Создать черновик</button></div></form></Modal>;
}
function RequestModal({ close, submit }: { close: () => void; submit: () => void }) {
  return <Modal title="Новая заявка" subtitle="Короткая форма для работы прямо со стройплощадки" close={close}><form onSubmit={(e) => { e.preventDefault(); submit(); }}><div className="form-grid"><label className="full"><span>Проект *</span><select required>{projects.map(p => <option key={p.name}>{p.name}</option>)}</select></label><label className="full"><span>Что требуется *</span><textarea placeholder="Материал, объём, важные характеристики" required /></label><label><span>Желаемый срок *</span><input type="date" required /></label><label><span>Ответственный снабженец</span><select><option>Илья Морозов</option><option>Анна Лебедева</option></select></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={close}>Отмена</button><button className="primary">Создать заявку</button></div></form></Modal>;
}
function Modal({ title, subtitle, close, children }: { title: string; subtitle: string; close: () => void; children: React.ReactNode }) {
  return <div className="overlay modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}><div className="modal"><header><div><h2>{title}</h2><p>{subtitle}</p></div><button onClick={close}>×</button></header>{children}</div></div>;
}
