import { useState } from 'react'
import { Plus, Send, Search, Clock, CheckCircle, XCircle, MessageSquare, User, Calendar } from 'lucide-react'

export default function Tickets() {
  const [tickets, setTickets] = useState([])

  const [selectedTicket, setSelectedTicket] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [newTicketData, setNewTicketData] = useState({
    subject: '',
    message: ''
  })

  const filteredTickets = tickets.filter(ticket =>
    ticket.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedTicket) return

    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === selectedTicket.id) {
        return {
          ...ticket,
          messages: [
            ...ticket.messages,
            {
              id: ticket.messages.length + 1,
              sender: 'admin',
              text: newMessage,
              time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            }
          ]
        }
      }
      return ticket
    })

    setTickets(updatedTickets)
    setSelectedTicket(updatedTickets.find(t => t.id === selectedTicket.id))
    setNewMessage('')
  }

  const handleCreateTicket = (e) => {
    e.preventDefault()
    const newTicket = {
      id: tickets.length + 1,
      user: 'Você',
      email: 'admin@example.com',
      subject: newTicketData.subject,
      status: 'open',
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: 1,
          sender: 'admin',
          text: newTicketData.message,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ]
    }
    setTickets([newTicket, ...tickets])
    setShowNewTicket(false)
    setNewTicketData({ subject: '', message: '' })
    setSelectedTicket(newTicket)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'closed': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <CheckCircle size={14} />
      case 'pending': return <Clock size={14} />
      case 'closed': return <XCircle size={14} />
      default: return <MessageSquare size={14} />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'open': return 'Aberto'
      case 'pending': return 'Aguardando'
      case 'closed': return 'Fechado'
      default: return 'Desconhecido'
    }
  }

  return (
    <div className="h-full flex gap-6">
      {/* Sidebar - Lista de Tickets */}
      <div className="w-96 flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tickets</h2>
            <button
              onClick={() => setShowNewTicket(true)}
              className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              title="Novo Ticket"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por usuário ou assunto..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        {/* Lista de Tickets */}
        <div className="flex-1 overflow-y-auto">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum ticket encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {filteredTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                    selectedTicket?.id === ticket.id ? 'bg-primary-50 dark:bg-slate-700 border-l-4 border-primary-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <User size={16} className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{ticket.user}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.email}</p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      {getStatusText(ticket.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
                    {ticket.subject}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar size={12} />
                    {new Date(ticket.createdAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(ticket.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Área de Chat */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
        {showNewTicket ? (
          /* Formulário Novo Ticket */
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Novo Ticket</h2>
            </div>
            <form onSubmit={handleCreateTicket} className="flex-1 flex flex-col p-6">
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assunto
                  </label>
                  <input
                    type="text"
                    value={newTicketData.subject}
                    onChange={(e) => setNewTicketData({ ...newTicketData, subject: e.target.value })}
                    placeholder="Digite o assunto do ticket"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mensagem
                  </label>
                  <textarea
                    value={newTicketData.message}
                    onChange={(e) => setNewTicketData({ ...newTicketData, message: e.target.value })}
                    placeholder="Descreva sua solicitação..."
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  Criar Ticket
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewTicket(false)
                    setNewTicketData({ subject: '', message: '' })
                  }}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        ) : selectedTicket ? (
          /* Chat do Ticket */
          <>
            {/* Header do Chat */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <User size={20} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{selectedTicket.user}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTicket.email}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor(selectedTicket.status)}`}>
                  {getStatusIcon(selectedTicket.status)}
                  {getStatusText(selectedTicket.status)}
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                <strong>Assunto:</strong> {selectedTicket.subject}
              </p>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedTicket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${
                    message.sender === 'admin'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                  } rounded-2xl px-4 py-3`}>
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'admin' ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input de Mensagem */}
            <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-end gap-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  rows={3}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(e)
                    }
                  }}
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Send size={18} />
                  Enviar
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Pressione Enter para enviar, Shift+Enter para nova linha
              </p>
            </form>
          </>
        ) : (
          /* Estado Vazio */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Selecione um ticket
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Escolha um ticket da lista para visualizar e responder
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
