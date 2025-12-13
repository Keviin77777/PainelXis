import { useState, useRef, useEffect } from 'react'
import { Calendar, Clock, X } from 'lucide-react'

export default function DateTimePicker({ value, onChange, placeholder = "Selecione uma data (opcional)" }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState('00:00')
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (value) {
      const date = new Date(value)
      setSelectedDate(date)
      setSelectedTime(`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`)
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const [hours, minutes] = selectedTime.split(':')
    newDate.setHours(parseInt(hours), parseInt(minutes))
    setSelectedDate(newDate)
  }

  const handleConfirm = () => {
    if (selectedDate) {
      const [hours, minutes] = selectedTime.split(':')
      const finalDate = new Date(selectedDate)
      finalDate.setHours(parseInt(hours), parseInt(minutes))
      onChange(finalDate.toISOString().slice(0, 16))
    }
    setIsOpen(false)
  }

  const handleClear = () => {
    setSelectedDate(null)
    setSelectedTime('00:00')
    onChange('')
    setIsOpen(false)
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const formatDisplayDate = () => {
    if (!selectedDate) return ''
    const date = new Date(selectedDate)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year} ${selectedTime}`
  }

  const renderCalendarDays = () => {
    const days = []
    const totalDays = daysInMonth(currentMonth)
    const firstDay = firstDayOfMonth(currentMonth)
    const today = new Date()

    // Dias vazios antes do primeiro dia do mês
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>)
    }

    // Dias do mês
    for (let day = 1; day <= totalDays; day++) {
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getFullYear() === currentMonth.getFullYear()
      
      const isToday = today.getDate() === day && 
        today.getMonth() === currentMonth.getMonth() &&
        today.getFullYear() === currentMonth.getFullYear()

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          className={`h-10 rounded-lg text-sm font-medium transition-all ${
            isSelected
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : isToday
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          {day}
        </button>
      )
    }

    return days
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          readOnly
          value={formatDisplayDate()}
          onClick={() => setIsOpen(!isOpen)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 pr-24 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 cursor-pointer transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {selectedDate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={18} />
            </button>
          )}
          <Calendar size={18} className="text-gray-400 pointer-events-none" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl p-4 w-80">
          {/* Header do Calendário */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </p>
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Dias da Semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 h-8 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          {/* Dias do Mês */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {renderCalendarDays()}
          </div>

          {/* Seletor de Hora */}
          <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Clock size={16} />
              Horário
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md font-medium transition-colors text-sm"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedDate}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
