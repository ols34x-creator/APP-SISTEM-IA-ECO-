import React from 'react';

const moduleGroups = [
  {
    title: 'Operação Central',
    icon: 'fa-clipboard-list',
    items: [
      'Ordem de Serviço com status, prazos e responsáveis',
      'Orçamento inteligente com histórico e travas pós-aprovação',
      'Agenda por box/elevador com alertas de atraso',
      'Notificações via WhatsApp e alertas internos',
    ],
  },
  {
    title: 'Cadastros & Histórico',
    icon: 'fa-id-card',
    items: [
      'Clientes com histórico completo e observações estratégicas',
      'Veículos vinculados com fotos e dados técnicos',
      'Vínculo automático entre cliente, veículo e OS',
      'Registro de revisões, serviços e recorrência',
    ],
  },
  {
    title: 'Funilaria Visual',
    icon: 'fa-car-crash',
    items: [
      'Upload de fotos antes/durante/depois',
      'Relatório fotográfico automático para seguradoras',
      'Marcação visual de danos por etapa',
      'Evidências centralizadas por OS',
    ],
  },
  {
    title: 'Estoque & Peças',
    icon: 'fa-boxes',
    items: [
      'Cadastro de peças com custo e preço de venda',
      'Entrada/saída automática vinculada à OS',
      'Alerta de estoque baixo em tempo real',
      'Histórico de consumo por serviço',
    ],
  },
  {
    title: 'Financeiro Profissional',
    icon: 'fa-cash-register',
    items: [
      'Controle de entradas, saídas e contas a receber',
      'Lucro por OS, cliente e período',
      'Formas de pagamento completas (Pix, cartão, parcelado)',
      'Relatórios diários e mensais automatizados',
    ],
  },
  {
    title: 'Documentos & Pós-venda',
    icon: 'fa-file-signature',
    items: [
      'PDFs automáticos com logo da oficina',
      'Relatórios de funilaria e ordens de serviço',
      'Lembretes de revisão e pós-venda',
      'Fluxo de aprovação com envio direto ao cliente',
    ],
  },
];

const workflowSteps = [
  {
    title: 'Recepção e Diagnóstico',
    detail: 'Cadastro do cliente/veículo, fotos iniciais e triagem técnica.',
  },
  {
    title: 'Orçamento & Aprovação',
    detail: 'Serviços detalhados, peças e mão de obra com envio por PDF.',
  },
  {
    title: 'Execução Controlada',
    detail: 'Status em tempo real, fotos do progresso e apontamentos da equipe.',
  },
  {
    title: 'Entrega & Pós-venda',
    detail: 'Checklist final, emissão de documentos e disparo de lembretes.',
  },
];

const techStack = [
  { label: 'Frontend', value: 'React + Vite + Tailwind (tema dark)' },
  { label: 'Backend', value: 'Node.js (API REST) ou Python/Flask' },
  { label: 'Autenticação', value: 'JWT com níveis de acesso' },
  { label: 'Banco', value: 'SQLite local + PostgreSQL para escala' },
  { label: 'Desktop', value: 'Electron ou Tauri' },
];

const WorkshopSystem: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 text-light">
      <section className="bg-bg-card/80 border border-border-color/60 rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col gap-4">
          <span className="text-xs uppercase tracking-[0.4em] text-secondary font-semibold">
            Oficina Mecânica + Funilaria
          </span>
          <h1 className="text-4xl md:text-5xl font-black">
            Sistema Completo, Profissional e Pronto para Produto
          </h1>
          <p className="text-gray-text text-lg max-w-3xl">
            Controle total da operação: do cliente ao caixa, do orçamento ao pós-venda, com módulos integrados,
            relatórios inteligentes e gestão visual de funilaria.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {[
              { label: 'Perfis', value: 'Admin, Técnico, Funilaria, Atendimento, Financeiro' },
              { label: 'Plataformas', value: 'Web, Desktop (Electron/Tauri) e Mobile' },
              { label: 'Modelo', value: 'Uso local com backup + SaaS escalável' },
            ].map((item) => (
              <div key={item.label} className="bg-bg-main/60 rounded-xl border border-border-color/50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-gray-text">{item.label}</p>
                <p className="text-sm font-semibold text-light mt-2">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {moduleGroups.map((group) => (
          <div key={group.title} className="bg-bg-card/70 border border-border-color/60 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <i className={`fas ${group.icon}`}></i>
              </div>
              <h2 className="text-xl font-bold">{group.title}</h2>
            </div>
            <ul className="space-y-3 text-sm text-gray-text">
              {group.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-primary mt-1">
                    <i className="fas fa-check-circle"></i>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="bg-bg-card/80 border border-border-color/60 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
            <i className="fas fa-route"></i>
          </div>
          <h2 className="text-2xl font-bold">Fluxo Operacional da Ordem de Serviço</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workflowSteps.map((step, index) => (
            <div key={step.title} className="bg-bg-main/60 border border-border-color/50 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-full">
                  ETAPA {index + 1}
                </span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
              </div>
              <p className="text-sm text-gray-text">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card/70 border border-border-color/60 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <i className="fas fa-chart-line"></i>
            </span>
            Relatórios Estratégicos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-text">
            {[
              'Faturamento por período e por OS',
              'Tempo médio por serviço e equipe',
              'Serviços e peças mais vendidos',
              'Clientes recorrentes e ticket médio',
            ].map((item) => (
              <div key={item} className="bg-bg-main/60 border border-border-color/40 rounded-lg p-3">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-bg-card/70 border border-border-color/60 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <i className="fas fa-layer-group"></i>
            </span>
            Stack Recomendada
          </h2>
          <ul className="space-y-3 text-sm text-gray-text">
            {techStack.map((item) => (
              <li key={item.label} className="flex flex-col gap-1 bg-bg-main/60 border border-border-color/40 rounded-lg p-3">
                <span className="text-xs uppercase tracking-[0.2em] text-gray-400">{item.label}</span>
                <span className="text-light font-semibold">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary/10 via-bg-card/70 to-secondary/10 border border-border-color/60 rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.4em] text-primary font-semibold">
            Diferencial Produto
          </span>
          <h2 className="text-2xl md:text-3xl font-black">
            Pronto para virar SaaS e gerar recorrência
          </h2>
          <p className="text-sm md:text-base text-gray-text max-w-3xl">
            Interface profissional, dados centralizados, visão visual da funilaria e controle financeiro completo.
            Ideal para transformar uma oficina em operação escalável.
          </p>
        </div>
      </section>
    </div>
  );
};

export default WorkshopSystem;
