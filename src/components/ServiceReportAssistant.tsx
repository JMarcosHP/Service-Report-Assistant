import React, { useState, useEffect } from 'react';
import { Save, Trash2, FileText, Download, Calendar, Home, Menu, X } from 'lucide-react';

interface Publisher {
  name: string;
  serviceType: string;
  participation: string;
  hours: number;
  courses: number;
  notes: string;
  privilege: string;
  specialServants: string;
  hope: string;
  isEditing: boolean; // Nuevo campo
  isNew: boolean; // Para distinguir nuevos publicadores
}

interface GroupData {
  publishers: Publisher[];
  summary: {
    unbaptizedPublishers: { informes: number; cursos: number; total: number };
    publishers: { informes: number; horas: number; cursos: number; total: number };
    auxiliarPioneers: { informes: number; horas: number; cursos: number; total: number };
    regularPioneers: { informes: number; horas: number; cursos: number; total: number };
    specialPioneers: { informes: number; horas: number; cursos: number; total: number };
    missionaries: { informes: number; horas: number; cursos: number; total: number };
  };
  specialServants?: {
    circuitOverseers?: number;
    bethelites?: number;
    constructionServants?: number;
    theocraticSchoolInstructors?: number;
    volunteersA2?: number;
    volunteersA19?: number;
    volunteersA2ToA19?: number;
  };
  otherCategories?: {
    otherSheep?: number;
    anointed?: number;
    ministerialServants?: number;
    elders?: number;
    activePublishers?: number;
    inactivePublishers?: number;
    totalCongregationPublishers?: number;
  };
  superintendent?: string; // Nuevo campo
  assistant?: string; // Nuevo campo
}

interface GroupTableProps {
  groupNumber: number;
  groupData: GroupData;
  addPublisher: () => void;
  updatePublisher: (index: number, field: keyof Publisher, value: any) => void;
  removePublisher: (index: number) => void;
  savePublisher: (index: number) => void;        // Nueva prop
  toggleEditPublisher: (index: number) => void;  // Nueva prop
  updateGroupLeader: (field: 'superintendent' | 'assistant', value: string) => void; // Nueva prop
}

interface AveragesTableProps {
  totals: {
    [key: string]: any;
  } ;
}

// Primero definimos un tipo personalizado para activeGroup
type ActiveGroupType = number | 'averages';

// Mover la función createEmptyMonthData antes del componente
const createEmptyMonthData = (): Record<number, GroupData> => {
  const data: Record<number, GroupData> = {};
  
  for (let i = 1; i <= 10; i++) {
    data[i] = {
      publishers: [],
      summary: {
        unbaptizedPublishers: { informes: 0, cursos: 0, total: 0 },
        publishers: { informes: 0, horas: 0, cursos: 0, total: 0 },
        auxiliarPioneers: { informes: 0, horas: 0, cursos: 0, total: 0 },
        regularPioneers: { informes: 0, horas: 0, cursos: 0, total: 0 },
        specialPioneers: { informes: 0, horas: 0, cursos: 0, total: 0 },
        missionaries: { informes: 0, horas: 0, cursos: 0, total: 0 }
      },
      specialServants: {
        circuitOverseers: 0,
        bethelites: 0,
        constructionServants: 0,
        theocraticSchoolInstructors: 0,
        volunteersA2: 0, 
        volunteersA19: 0,
        volunteersA2ToA19: 0
      },
      otherCategories: {
        otherSheep: 0,
        anointed: 0,
        ministerialServants: 0,
        elders: 0,
        activePublishers: 0,
        inactivePublishers: 0,
        totalCongregationPublishers: 0
      },
      superintendent: '', // Inicializar nuevo campo
      assistant: '' // Inicializar nuevo campo
    };
  }
  return data;
};

// Main application component
const ServiceReportAssistant = () => {
  // State management
  const [activeGroup, setActiveGroup] = useState<ActiveGroupType>(1);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [groupData, setGroupData] = useState<Record<number, GroupData>>(() => createEmptyMonthData());
  const [totals, setTotals] = useState<Record<string, any>>({});
  const [monthlyData, setMonthlyData] = useState<Record<string, Record<number, GroupData>>>({});
  const [availableMonths, setAvailableMonths] = useState<Array<{key: string; year: number; month: number}>>([]);
  const [isNavOpen, setIsNavOpen] = useState(() => {
    // Intentar obtener la preferencia guardada, por defecto abierto
    const saved = localStorage.getItem('navPreference');
    return saved ? JSON.parse(saved) : true;
  });

  // Agregar este efecto para guardar la preferencia
  useEffect(() => {
    localStorage.setItem('navPreference', JSON.stringify(isNavOpen));
  }, [isNavOpen]);

  const [isPanelPinned, setIsPanelPinned] = useState(true); // Estado para fijar el panel

  // En el componente ServiceReportAssistant, agregar un nuevo estado para controlar el panel en desktop
  const [isDesktopPanelExpanded, setIsDesktopPanelExpanded] = useState(true);
  
  // Load initial data
  useEffect(() => {
    const loadInitialData = () => {
      const initialMonthlyData: Record<string, Record<number, GroupData>> = {};
      
      // Create data for current month and two previous months as examples
      const currentDate = new Date();
      const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
      
      // Previous month
      const prevDate = new Date();
      prevDate.setMonth(prevDate.getMonth() - 1);
      const prevMonthKey = `${prevDate.getFullYear()}-${prevDate.getMonth()}`;
      
      // Two months ago
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const twoMonthsAgoKey = `${twoMonthsAgo.getFullYear()}-${twoMonthsAgo.getMonth()}`;
      
      // Add sample data for three months with el tipado correcto
      initialMonthlyData[currentMonthKey] = createEmptyMonthData();
      initialMonthlyData[prevMonthKey] = createEmptyMonthData();
      initialMonthlyData[twoMonthsAgoKey] = createEmptyMonthData();
      
      // Set available months for navigation
      const monthsList = [
        { key: currentMonthKey, year: currentDate.getFullYear(), month: currentDate.getMonth() },
        { key: prevMonthKey, year: prevDate.getFullYear(), month: prevDate.getMonth() },
        { key: twoMonthsAgoKey, year: twoMonthsAgo.getFullYear(), month: twoMonthsAgo.getMonth() }
      ];
      
      setMonthlyData(initialMonthlyData);
      setAvailableMonths(monthsList);
      
      // Set current month's data as active
      setGroupData(initialMonthlyData[currentMonthKey]);
    };
    
    loadInitialData();
  }, []); // Agregar dependencias necesarias si las hay

  // Calculate totals and averages
  useEffect(() => {
    const calculateTotals = () => {
      if (Object.keys(groupData).length > 0) {
        const calculatedTotals = {
          unbaptizedPublishers: { informes: 0, cursos: 0, promedio: 0 },
          publishers: { informes: 0, horas: 0, cursos: 0, promedio: 0 },
          auxiliarPioneers: { informes: 0, horas: 0, cursos: 0, promedio: 0 },
          // ... más cálculos
        };
        
        // Calcular totales
        Object.values(groupData).forEach(group => {
          group.publishers.forEach(pub => {
            // Actualizar calculatedTotals según el tipo de publicador
            // ... lógica de cálculo
          });
        });
        
        setTotals(calculatedTotals);
      }
    };
    
    calculateTotals();
  }, [groupData]);

  // Add a new publisher to the active group
  const addPublisher = () => {
    if (typeof activeGroup !== 'number') {
      console.error('No se puede añadir publicador en la vista de promedios');
      return;
    }

    const updatedGroupData = {...groupData};
    updatedGroupData[activeGroup].publishers.push({
      name: '',
      serviceType: '',
      participation: '',
      hours: 0,
      courses: 0,
      notes: '',
      privilege: '',
      specialServants: '',
      hope: '',
      isEditing: true, // Comenzar en modo edición
      isNew: true // Marcar como nuevo publicador
    });
    setGroupData(updatedGroupData);
    
    // Also update in monthly data
    const monthKey = `${currentYear}-${currentMonth}`;
    const updatedMonthlyData = {...monthlyData};
    updatedMonthlyData[monthKey] = updatedGroupData;
    setMonthlyData(updatedMonthlyData);
  };

  // Update publisher data
  const updatePublisher = (index: number, field: keyof Publisher, value: any) => {
    setGroupData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (newData[activeGroup]?.publishers?.[index]) {
        // Si está cambiando a publicador no bautizado, limpiar campos restringidos
        if (field === 'serviceType' && value === 'unbaptizedPublisher') {
          newData[activeGroup].publishers[index].privilege = '';
          newData[activeGroup].publishers[index].specialServants = '';
          newData[activeGroup].publishers[index].hope = 'otherSheep'; // Forzar a "Otras Ovejas"
        }

        // Si es publicador no bautizado y está intentando cambiar a ungido, prevenir
        if (field === 'hope' && 
            value === 'anointed' && 
            newData[activeGroup].publishers[index].serviceType === 'unbaptizedPublisher') {
          console.warn('Los publicadores no bautizados no pueden ser ungidos');
          value = 'otherSheep';
        }

        // Si está cambiando la participación a "inactive", limpiar horas y cursos
        if (field === 'participation' && value === 'inactive') {
          newData[activeGroup].publishers[index].hours = 0;
          newData[activeGroup].publishers[index].courses = 0;
        }

        newData[activeGroup].publishers[index][field] = value;
        
        // Actualizar monthlyData al mismo tiempo
        const monthKey = `${currentYear}-${currentMonth}`;
        setMonthlyData(prevMonthlyData => ({
          ...prevMonthlyData,
          [monthKey]: newData
        }));
        
        return newData;
      }
      return prevData;
    });
  };

  // Remove a publisher
  const removePublisher = (index: number) => {
    if (typeof activeGroup !== 'number') {
      console.error('Active group must be a number.');
      return;
    }

    // Mostrar diálogo de confirmación
    if (!window.confirm('¿Está seguro que desea eliminar este publicador?')) {
      return;
    }

    const updatedGroupData = { ...groupData };
    updatedGroupData[activeGroup].publishers.splice(index, 1);
    setGroupData(updatedGroupData);

    // Also update in monthly data
    const monthKey = `${currentYear}-${currentMonth}`;
    const updatedMonthlyData = { ...monthlyData };
    updatedMonthlyData[monthKey] = updatedGroupData;
    setMonthlyData(updatedMonthlyData);
  };

  // Clear all data from current group
  const clearGroupData = () => {
    if (typeof activeGroup !== 'number') {
      console.error('Active group must be a number.');
      return;
    }
    const updatedGroupData = { ...groupData };
    updatedGroupData[activeGroup].publishers = [];
    setGroupData(updatedGroupData);

    // Also update in monthly data
    const monthKey = `${currentYear}-${currentMonth}`;
    const updatedMonthlyData = { ...monthlyData };
    updatedMonthlyData[monthKey] = updatedGroupData;
    setMonthlyData(updatedMonthlyData);
  };

  // Clear specific fields (hours, courses, notes)
  const clearFields = () => {
    if (typeof activeGroup !== 'number') {
      console.error('Active group must be a number.');
      return;
    }
    const updatedGroupData = { ...groupData };
    updatedGroupData[activeGroup].publishers.forEach((publisher: Publisher) => {
      publisher.hours = 0;
      publisher.courses = 0;
      publisher.notes = '';
    });
    setGroupData(updatedGroupData);

    // Also update in monthly data
    const monthKey = `${currentYear}-${currentMonth}`;
    const updatedMonthlyData = { ...monthlyData };
    updatedMonthlyData[monthKey] = updatedGroupData;
    setMonthlyData(updatedMonthlyData);
  };

  // Create new month (duplicate structure but clear data)
  const createNewMonth = () => {
    const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const newMonthKey = `${newYear}-${newMonth}`;
    
    // Check if this month already exists
    if (monthlyData[newMonthKey]) {
      // If exists, just switch to it
      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
      setGroupData(monthlyData[newMonthKey]);
      return;
    }
    
    // Save current month data
    const currentMonthKey = `${currentYear}-${currentMonth}`;
    const updatedMonthlyData = {...monthlyData};
    updatedMonthlyData[currentMonthKey] = {...groupData};
    
    // Create new month with preserved structure but cleared data
    const newMonthData = JSON.parse(JSON.stringify(groupData)); // Deep clone
    for (let group in newMonthData) {
      newMonthData[group].publishers.forEach((publisher: Publisher) => {
        publisher.hours = 0;
        publisher.courses = 0;
        publisher.notes = '';
      });
    }
    
    // Add new month to monthly data
    updatedMonthlyData[newMonthKey] = newMonthData;
    
    // Update available months list
    const updatedMonths = [
      ...availableMonths,
      { key: newMonthKey, year: newYear, month: newMonth }
    ].sort((a, b) => {
      // Sort by year and month (newest first)
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    
    // Update state
    setMonthlyData(updatedMonthlyData);
    setAvailableMonths(updatedMonths);
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setGroupData(newMonthData);
  };
  
  // Switch to a specific month
  const switchToMonth = (yearMonth: string) => {
    try {
      const [year, month] = yearMonth.split('-').map(Number);
      
      if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
        throw new Error('Fecha inválida');
      }
      
      const monthKey = `${year}-${month}`;
      if (!monthlyData[monthKey]) {
        console.error('No hay datos para el mes seleccionado');
        return;
      }
      
      setCurrentMonth(month);
      setCurrentYear(year);
      setGroupData(monthlyData[monthKey]);
    } catch (error) {
      console.error('Error al cambiar de mes:', error);
    }
  };

  // Export data to PDF (placeholder - would use a PDF library in real implementation)
  const exportToPdf = (groupNumber: number | 'averages') => {
    alert(`Exporting Group ${groupNumber} to PDF`);
    // In a real app, this would generate a PDF using a library like jsPDF
  };

  // Export all to PDF
  const exportAllToPdf = () => {
    alert('Exporting all groups to PDF');
    // In a real app, this would generate a complete PDF
  };

  // Ahora la función navigateToGroup quedará así
  const navigateToGroup = (groupNumber: ActiveGroupType) => {
    if (typeof groupNumber === 'number' && (groupNumber < 1 || groupNumber > 10)) {
      console.error('Número de grupo inválido');
      return;
    }
    setActiveGroup(groupNumber);
  };

  // Get month name
  const getMonthName = (monthIndex: number): string => {
    if (monthIndex < 0 || monthIndex > 11) {
      console.error('Índice de mes inválido');
      return '';
    }
    
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[monthIndex];
  };

  // En el componente ServiceReportAssistant
  const toggleEditPublisher = (index: number) => {
    setGroupData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (newData[activeGroup]?.publishers?.[index]) {
        newData[activeGroup].publishers[index].isEditing = 
          !newData[activeGroup].publishers[index].isEditing;
      }
      return newData;
    });
  };

  const savePublisher = (index: number) => {
    setGroupData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (newData[activeGroup]?.publishers?.[index]) {
        const publisher = newData[activeGroup].publishers[index];
        
        // Validar campos obligatorios
        if (!publisher.name.trim()) {
          alert('El nombre del publicador es obligatorio');
          return prevData;
        }

        if (!publisher.serviceType) {
          alert('El tipo de servicio es obligatorio');
          return prevData;
        }

        if (!publisher.hope) {
          alert('La esperanza es obligatoria');
          return prevData;
        }

        // Quitar modo edición y marcar como no nuevo
        publisher.isEditing = false;
        publisher.isNew = false;

        // Actualizar monthlyData
        const monthKey = `${currentYear}-${currentMonth}`;
        setMonthlyData(prevMonthlyData => ({
          ...prevMonthlyData,
          [monthKey]: newData
        }));
      }
      return newData;
    });
  };

  // Nueva función para actualizar el superintendente o auxiliar del grupo
  const updateGroupLeader = (field: 'superintendent' | 'assistant', value: string) => {
    setGroupData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (newData[activeGroup]) {
        newData[activeGroup][field] = value;
        
        // Actualizar monthlyData al mismo tiempo
        const monthKey = `${currentYear}-${currentMonth}`;
        setMonthlyData(prevMonthlyData => ({
          ...prevMonthlyData,
          [monthKey]: newData
        }));
        
        return newData;
      }
      return prevData;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-800 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Registro de Actividad de la Congregación</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select 
                className="bg-blue-700 text-white px-4 py-2 rounded appearance-none cursor-pointer pr-8"
                value={`${currentYear}-${currentMonth}`}
                onChange={(e) => switchToMonth(e.target.value)}
              >
                {availableMonths.map(item => (
                  <option key={item.key} value={item.key}>
                    {getMonthName(item.month)} {item.year}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            <button 
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded flex items-center"
              onClick={createNewMonth}
            >
              <Calendar className="mr-2" size={18} />
              Nuevo Mes
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Panel de navegación */}
        <nav 
          className={`
            fixed md:relative inset-y-0 left-0 bg-gray-200 
            transform transition-all duration-300 ease-in-out z-40
            ${isNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            ${isDesktopPanelExpanded ? 'w-60' : 'w-12'}
            hidden md:block
          `}
        >
          {/* Botón para expandir/contraer en desktop */}
          <div className={`
            hidden md:flex justify-${isDesktopPanelExpanded ? 'end' : 'center'}
            p-2 transition-all duration-300
          `}>
            <button
              className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
              onClick={() => setIsDesktopPanelExpanded(!isDesktopPanelExpanded)}
              title={isDesktopPanelExpanded ? "Contraer panel" : "Expandir panel"}
            >
              {isDesktopPanelExpanded ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Contenido del panel */}
          <div className={`${isDesktopPanelExpanded ? 'px-4' : 'px-2'}`}>
            <h2 className={`
              text-lg font-semibold mb-4 transition-opacity duration-300
              ${isDesktopPanelExpanded ? 'opacity-100' : 'opacity-0 hidden'}
            `}>
              Navegación
            </h2>
            <ul className="space-y-2">
              {/* Sección de Grupos */}
              {[...Array(10)].map((_, i) => (
                <li key={i}>
                  <button 
                    className={`
                      w-full rounded flex items-center justify-${isDesktopPanelExpanded ? 'start' : 'center'} p-2
                      ${activeGroup === i+1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-300'}
                    `}
                    onClick={() => {
                      navigateToGroup(i+1);
                      if (window.innerWidth < 768) setIsNavOpen(false);
                    }}
                    title={!isDesktopPanelExpanded ? `Ir al grupo ${i+1}` : ''}
                  >
                    <span className={`w-3 h-3 rounded-full 
                      ${['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-blue-500', 
                        'bg-green-500', 'bg-indigo-500', 'bg-orange-500', 'bg-pink-300', 
                        'bg-purple-500', 'bg-teal-500'][i]}
                    `}/>
                    {isDesktopPanelExpanded && <span className="ml-2">Grupo {i+1}</span>}
                  </button>
                </li>
              ))}

              {/* Separador */}
              <li className="border-t border-gray-300 my-2"></li>

              {/* Promedios */}
              <li>
                <button 
                  className={`
                    w-full rounded flex items-center justify-${isDesktopPanelExpanded ? 'start' : 'center'} p-2
                    ${activeGroup === 'averages' ? 'bg-blue-600 text-white' : 'hover:bg-gray-300'}
                  `}
                  onClick={() => {
                    navigateToGroup('averages');
                    if (window.innerWidth < 768) setIsNavOpen(false);
                  }}
                  title={!isDesktopPanelExpanded ? "Ver promedios" : ''}
                >
                  <Home size={18} />
                  {isDesktopPanelExpanded && <span className="ml-2">Promedios</span>}
                </button>
              </li>

              {/* Separador */}
              <li className="border-t border-gray-300 my-2"></li>

              {/* Utilidades */}
              <li>
                <button 
                  className={`w-full rounded flex items-center justify-${isDesktopPanelExpanded ? 'start' : 'center'} p-2 hover:bg-gray-300`}
                  onClick={() => exportAllToPdf()}
                  title={!isDesktopPanelExpanded ? "Exportar todo" : ''}
                >
                  <Download size={18} />
                  {isDesktopPanelExpanded && <span className="ml-2">Exportar Todo</span>}
                </button>
              </li>
              {typeof activeGroup === 'number' && (
                <li>
                  <button 
                    className={`w-full rounded flex items-center justify-${isDesktopPanelExpanded ? 'start' : 'center'} p-2 hover:bg-gray-300`}
                    onClick={() => exportToPdf(activeGroup)}
                    title={!isDesktopPanelExpanded ? "Exportar grupo actual" : ''}
                  >
                    <Download size={18} />
                    {isDesktopPanelExpanded && <span className="ml-2">Exportar Grupo Actual</span>}
                  </button>
                </li>
              )}
            </ul>
          </div>
        </nav>

        {/* Versión móvil del panel */}
        <div className="md:hidden">
          {!isNavOpen && (
            <button
              className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
              onClick={() => setIsNavOpen(true)}
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* Content area */}
        <main className={`
          flex-1 p-4 overflow-y-auto transition-all duration-300
          ${isDesktopPanelExpanded ? 'md:ml-15' : 'md:ml-5'}
        `}>
          {activeGroup === 'averages' ? (
            <AveragesTable totals={totals} />
          ) : (
            <GroupTable 
              groupNumber={activeGroup}
              groupData={groupData[activeGroup]} 
              addPublisher={addPublisher}
              updatePublisher={updatePublisher}
              removePublisher={removePublisher}
              savePublisher={savePublisher}           // Pasar la función
              toggleEditPublisher={toggleEditPublisher} // Pasar la función
              updateGroupLeader={updateGroupLeader} // Pasar la función
            />
          )}
        </main>
      </div>
    </div>
  );
};

// Group table component
const GroupTable = ({ 
  groupNumber, 
  groupData, 
  addPublisher, 
  updatePublisher, 
  removePublisher,
  savePublisher,           // Agregar parámetro
  toggleEditPublisher,      // Agregar parámetro
  updateGroupLeader // Agregar parámetro
}: GroupTableProps) => {
  // Agregar esta función de validación
  const isUnbaptizedPublisher = (publisher: Publisher): boolean => {
    return publisher.serviceType === 'unbaptizedPublisher';
  };

  const isRegularPublisher = (publisher: Publisher): boolean => {
    return publisher.serviceType === 'publisher' || 
          publisher.serviceType === 'unbaptizedPublisher';
  };

  // En el componente GroupTable, agregar esta función de validación
  const isInactive = (publisher: Publisher): boolean => {
    return publisher.participation === 'inactive';
  };

  // Dentro del componente GroupTable, agregar estas funciones de cálculo:
  const calculateSummary = (publishers: Publisher[]) => {
    const summary = {
      unbaptizedPublisher: { informes: 0, horas: 0, cursos: 0 },
      publisher: { informes: 0, horas: 0, cursos: 0 },
      auxiliarPioneer: { informes: 0, horas: 0, cursos: 0 },
      regularPioneer: { informes: 0, horas: 0, cursos: 0 },
      specialPioneer: { informes: 0, horas: 0, cursos: 0 },
      missionary: { informes: 0, horas: 0, cursos: 0 }
    };
  
    publishers.forEach(pub => {
      // No contar publicadores en edición o nuevos
      if (pub.isEditing || pub.isNew) return;

      if (pub.serviceType && pub.serviceType in summary) {
        // Solo contar si está activo
        if (pub.participation === 'active') {
          summary[pub.serviceType as keyof typeof summary].informes++;
          
          // Sumar horas (excepto para publicadores regulares y no bautizados)
          if (!isRegularPublisher(pub)) {
            summary[pub.serviceType as keyof typeof summary].horas += (pub.hours || 0);
          }
          
          // Sumar cursos
          summary[pub.serviceType as keyof typeof summary].cursos += (pub.courses || 0);
        }
      }
    });
  
    return summary;
  };

  const calculateSpecialServants = (publishers: Publisher[]) => {
    const counts = {
      circuitOverseer: 0,
      bethelite: 0,
      construction: 0,
      instructor: 0,
      volunteerA2: 0,
      volunteerA19: 0,
      volunteerA2ToA19: 0
    };
  
    publishers.forEach(pub => {
      // No contar publicadores en edición o nuevos
      if (pub.isEditing || pub.isNew) return;

      if (pub.specialServants && pub.specialServants in counts) {
        counts[pub.specialServants as keyof typeof counts]++;
      }
    });
  
    return counts;
  };

  // En el componente GroupTable, modificar la función calculatePrivileges
  const calculatePrivileges = (publishers: Publisher[]) => {
    const counts = {
      elders: 0,
      ministerialServants: 0,
      inactivePublishers: 0,
      otherSheep: 0,    // Añadir conteo de Otras Ovejas
      anointed: 0       // Añadir conteo de Ungidos
    };
  
    publishers.forEach(pub => {
      // No contar publicadores en edición o nuevos
      if (pub.isEditing || pub.isNew) return;

      if (pub.privilege === 'elder') {
        counts.elders++;
      }
      if (pub.privilege === 'ministerialServant') {
        counts.ministerialServants++;
      }
      if (pub.participation === 'inactive') {
        counts.inactivePublishers++;
      }
      // Añadir conteo de esperanzas
      if (pub.hope === 'otherSheep') {
        counts.otherSheep++;
      }
      if (pub.hope === 'anointed') {
        counts.anointed++;
      }
    });
  
    return counts;
  };

  // En el componente GroupTable, agregar esta nueva función para calcular totales por tipo
  const calculatePublisherTotals = (publishers: Publisher[]) => {
    const totals = {
      unbaptizedPublishers: 0,
      baptizedPublishers: 0,
      auxiliarPioneers: 0,
      regularPioneers: 0,
      specialPioneers: 0,
      missionaries: 0
    };
  
    publishers.forEach(pub => {
      // No contar publicadores en edición o nuevos
      if (pub.isEditing || pub.isNew) return;

      switch (pub.serviceType) {
        case 'unbaptizedPublisher':
          totals.unbaptizedPublishers++;
          break;
        case 'publisher':
          totals.baptizedPublishers++;
          break;
        case 'auxiliarPioneer':
          totals.auxiliarPioneers++;
          break;
        case 'regularPioneer':
          totals.regularPioneers++;
          break;
        case 'specialPioneer':
          totals.specialPioneers++;
          break;
        case 'missionary':
          totals.missionaries++;
          break;
      }
    });
  
    return totals;
  };

  if (!groupData) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">No hay datos disponibles para este grupo.</p>
      </div>
    );
  }

  if (!Array.isArray(groupData.publishers)) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">Error: Datos del grupo inválidos</p>
      </div>
    );
  }
  if (!groupData?.publishers) return <div className='p-4 text-center'><p>No hay datos disponibles para este grupo.</p></div>;

  // En el componente GroupTable, modificar el encabezado del grupo
  const getGroupColor = (groupNumber: number): string => {
    const colors = [
      'bg-blue-500',   // Grupo 1
      'bg-green-500',  // Grupo 2
      'bg-yellow-500', // Grupo 3
      'bg-blue-500',   // Grupo 4
      'bg-green-500',  // Grupo 5
      'bg-indigo-500', // Grupo 6
      'bg-orange-500', // Grupo 7
      'bg-pink-300',   // Grupo 8
      'bg-purple-500', // Grupo 9
      'bg-teal-500'    // Grupo 10
    ];
    return colors[groupNumber - 1] || 'bg-gray-500';
  };

  return (
    <div>
      {/* Encabezado del grupo con superintendente y auxiliar */}
      <div className="mb-4">
        <h2 className={`text-lg font-bold ${getGroupColor(groupNumber)} text-white p-1 text-center`}>
          GRUPO {groupNumber}
        </h2>
        <div className="grid grid-cols-2 bg-gray-200">
          <div className="p-1 border-r border-gray-400">
            <div className="flex items-center">
              <span className="text-sm font-semibold mr-2">Superintendente:</span>
              <input
                type="text"
                className="border rounded p-1 flex-1 text-sm"
                value={groupData.superintendent || ''}
                onChange={(e) => updateGroupLeader('superintendent', e.target.value)}
              />
            </div>
          </div>
          <div className="p-1">
            <div className="flex items-center">
              <span className="text-sm font-semibold mr-2">Auxiliar:</span>
              <input
                type="text"
                className="border rounded p-1 flex-1 text-sm"
                value={groupData.assistant || ''}
                onChange={(e) => updateGroupLeader('assistant', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botón de agregar publicador */}
      <div className="flex justify-end mb-4">
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          onClick={addPublisher}
        >
          Agregar Publicador
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border text-sm">
          <thead>
            <tr className="bg-blue-100">
              <th className="border p-1 text-xs">Publicadores</th>
              <th className="border p-1 text-xs w-56">Tipo de Servicio</th>
              <th className="border p-1 text-xs">Participación</th>
              {/* Reducir el ancho de las columnas Horas y Cursos */}
              <th className="border p-1 text-xs w-20">Horas</th>
              <th className="border p-1 text-xs w-20">Cursos</th>
              <th className="border p-1 text-xs">Notas</th>
              <th className="border p-1 text-xs">Privilegio</th>
              <th className="border p-1 text-xs">Siervos Especiales / Voluntarios</th>
              <th className="border p-1 text-xs w-40">Esperanza</th>
              <th className="border p-1 text-xs w-10">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {groupData.publishers.map((publisher, index) => (
              <tr key={index} className={`hover:bg-gray-50 ${publisher.isEditing ? 'bg-blue-50' : ''}`}>
                <td className="border p-1">
                  <input 
                    type="text" 
                    className={`w-full p-1 border rounded text-sm ${!publisher.name && publisher.isEditing ? 'border-red-500' : ''}`}
                    value={publisher.name || ''}
                    onChange={(e) => updatePublisher(index, 'name', e.target.value)}
                    disabled={!publisher.isEditing}
                    placeholder={publisher.isEditing ? "Nombre*" : ""}
                  />
                </td>
                <td className="border p-1">
                  <select 
                    className={`w-full p-1 border rounded text-center text-sm ${!publisher.serviceType && publisher.isEditing ? 'border-red-500' : ''}`}
                    value={publisher.serviceType || ''}
                    onChange={(e) => updatePublisher(index, 'serviceType', e.target.value)}
                    disabled={!publisher.isEditing}
                  >
                    <option value="">{publisher.isEditing ? "Seleccionar*" : "Seleccionar"}</option>
                    <option value="publisher">Publicador</option>
                    <option value="unbaptizedPublisher">Publicador No Bautizado</option>
                    <option value="auxiliarPioneer">Precursor Auxiliar</option>
                    <option value="regularPioneer">Precursor Regular</option>
                    <option value="specialPioneer">Precursor Especial</option>
                    <option value="missionary">Misionero</option>
                  </select>
                </td>
                <td className="border p-1">
                  <select 
                    className="w-full p-1 border rounded text-center text-sm"
                    value={publisher.participation || ''}
                    onChange={(e) => updatePublisher(index, 'participation', e.target.value)}
                    disabled={!publisher.isEditing}
                  >
                    <option value="">Seleccionar</option>
                    <option value="active">Sí</option>
                    <option value="inactive">No</option>
                  </select>
                </td>
                <td className="border p-1 w-20">
                  <input 
                    type="number" 
                    className="w-full p-1 border rounded text-center text-sm"
                    value={publisher.hours || 0}
                    onChange={(e) => updatePublisher(index, 'hours', parseInt(e.target.value) || 0)}
                    min="0"
                    disabled={isRegularPublisher(publisher) || isInactive(publisher) || !publisher.isEditing}
                  />
                </td>
                <td className="border p-1 w-20">
                  <input 
                    type="number" 
                    className="w-full p-1 border rounded text-center text-sm"
                    value={publisher.courses || 0}
                    onChange={(e) => updatePublisher(index, 'courses', parseInt(e.target.value) || 0)}
                    min="0"
                    disabled={isInactive(publisher) || !publisher.isEditing}
                  />
                </td>
                <td className="border p-1">
                  <input 
                    type="text" 
                    className="w-full p-1 border rounded text-sm"
                    value={publisher.notes || ''}
                    onChange={(e) => updatePublisher(index, 'notes', e.target.value)}
                    disabled={!publisher.isEditing}
                  />
                </td>
                {/* Modificar el select de privilegio */}
                <td className="border p-1">
                  <select 
                    className="w-full p-1 border rounded text-center text-sm"
                    value={publisher.privilege || ''}
                    onChange={(e) => updatePublisher(index, 'privilege', e.target.value)}
                    disabled={isUnbaptizedPublisher(publisher) || !publisher.isEditing}
                  >
                    <option value=""></option>
                    <option value="ministerialServant">Siervo Ministerial</option>
                    <option value="elder">Anciano</option>
                  </select>
                </td>

                {/* Modificar el select de siervos especiales */}
                <td className="border p-1">
                  <select 
                    className="w-full p-1 border rounded text-center text-sm"
                    value={publisher.specialServants || ''}
                    onChange={(e) => updatePublisher(index, 'specialServants', e.target.value)}
                    disabled={isUnbaptizedPublisher(publisher) || !publisher.isEditing}
                  >
                    <option value=""></option>
                    <option value="circuitOverseer">Superintendente de Circuito</option>
                    <option value="bethelite">Betelita</option>
                    <option value="construction">Siervo de construcción</option>
                    <option value="instructor">Instructor de Escuelas Teocráticas</option>
                    <option value="volunteerA2">Voluntario A-2</option>
                    <option value="volunteerA19">Voluntario A-19</option>
                    <option value="volunteerA2ToA19">Voluntario A-2 & A-19</option>
                  </select>
                </td>
                <td className="border p-1">
                  <select 
                    className={`w-full p-1 border rounded text-center text-sm ${!publisher.hope && publisher.isEditing ? 'border-red-500' : ''}`}
                    value={publisher.hope || ''}
                    onChange={(e) => updatePublisher(index, 'hope', e.target.value)}
                    disabled={isUnbaptizedPublisher(publisher) || !publisher.isEditing}
                  >
                    <option value="">{publisher.isEditing ? "Seleccionar*" : "Seleccionar"}</option>
                    <option value="otherSheep">Otras Ovejas</option>
                    <option value="anointed" disabled={isUnbaptizedPublisher(publisher)}>
                      Ungido
                    </option>
                  </select>
                </td>
                <td className="border p-1">
                  <div className="flex gap-1 justify-center">
                    {publisher.isEditing ? (
                      <button 
                        className="bg-green-500 hover:bg-green-600 text-white p-1 rounded"
                        onClick={() => savePublisher(index)}
                        title="Guardar"
                      >
                        <Save size={14} />
                      </button>
                    ) : (
                      <button 
                        className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded"
                        onClick={() => toggleEditPublisher(index)}
                        title="Editar"
                      >
                        <FileText size={14} />
                      </button>
                    )}
                    <button 
                      className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                      onClick={() => removePublisher(index)}
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="text-center bg-gray-200">
              <td className="border p-1"></td>
              <td className="border p-1"></td>
              <td className="border p-1"></td>
              <td className="border p-1"></td>
              <td className="border p-1"></td>
              <td className="border p-1" colSpan={5}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Group Summary */}
      <div className="mt-4">
        <h3 className="text-base font-bold mb-2">Resumen del Grupo</h3>
        <div className="grid grid-cols-3 gap-2">
          {/* Primera columna - Informes por Tipo de Publicador */}
          <div className="bg-white p-2 rounded shadow">
            <h4 className="text-sm font-semibold mb-1">Informes por Tipo de Publicador</h4>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-1 text-xs">Tipo</th>
                  <th className="border p-1 text-xs">Total</th>
                  <th className="border p-1 text-xs">Informaron</th>
                  <th className="border p-1 text-xs">Horas</th>
                  <th className="border p-1 text-xs">Cursos</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const summary = calculateSummary(groupData.publishers);
                  const totals = calculatePublisherTotals(groupData.publishers);
                  
                  return Object.entries(summary).map(([type, data]) => (
                    <tr key={type}>
                      <td className="border p-1">
                        {type === 'unbaptizedPublisher' ? 'Publicadores No Bautizados' :
                        type === 'publisher' ? 'Publicadores' :
                        type === 'auxiliarPioneer' ? 'Precursores Auxiliares' :
                        type === 'regularPioneer' ? 'Precursores Regulares' :
                        type === 'specialPioneer' ? 'Precursores Especiales' :
                        'Misioneros'}
                      </td>
                      <td className="border p-1 text-center">
                        {type === 'unbaptizedPublisher' ? totals.unbaptizedPublishers :
                        type === 'publisher' ? totals.baptizedPublishers :
                        type === 'auxiliarPioneer' ? totals.auxiliarPioneers :
                        type === 'regularPioneer' ? totals.regularPioneers :
                        type === 'specialPioneer' ? totals.specialPioneers :
                        totals.missionaries}
                      </td>
                      <td className="border p-1 text-center">{data.informes}</td>
                      <td className="border p-1 text-center">
                        {isRegularPublisher({serviceType: type} as Publisher) ? '-' : data.horas}
                      </td>
                      <td className="border p-1 text-center">{data.cursos}</td>
                    </tr>
                  ));
                })()}
                <tr className="bg-gray-50 font-semibold">
                  <td className="border p-1">Total General</td>
                  <td className="border p-1 text-center">
                    {groupData.publishers.filter(p => !p.isEditing && !p.isNew).length}
                  </td>
                  <td className="border p-1 text-center">
                    {groupData.publishers
                      .filter(p => !p.isEditing && !p.isNew && p.participation === 'active')
                      .length}
                  </td>
                  <td className="border p-1 text-center">
                    {groupData.publishers
                      .filter(p => !p.isEditing && !p.isNew)
                      .reduce((sum, p) => sum + (isRegularPublisher(p) ? 0 : (p.hours || 0)), 0)}
                  </td>
                  <td className="border p-1 text-center">
                    {groupData.publishers
                      .filter(p => !p.isEditing && !p.isNew)
                      .reduce((sum, p) => sum + (p.courses || 0), 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          {/* Segunda columna - Siervos Especiales */}
          <div className="bg-white p-2 rounded shadow">
            <h4 className="text-sm font-semibold mb-1">Siervos Especiales / Voluntarios</h4>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-1 text-xs">Tipo</th>
                  <th className="border p-1 text-xs">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(calculateSpecialServants(groupData.publishers)).map(([type, count]) => (
                  <tr key={type}>
                    <td className="border p-1">
                      {type === 'circuitOverseer' ? 'Superintendentes de Circuito' :
                      type === 'bethelite' ? 'Betelitas' :
                      type === 'construction' ? 'Siervos de construcción' :
                      type === 'instructor' ? 'Instructores de Escuelas Teocráticas' :
                      type === 'volunteerA2' ? 'Voluntarios A-2' :
                      type === 'volunteerA19' ? 'Voluntarios A-19' :
                      'Voluntarios A-2 & A-19'}
                    </td>
                    <td className="border text-center p-1">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Nueva tercera columna - Estadísticas del Grupo */}
          <div className="bg-white p-2 rounded shadow">
            <h4 className="text-sm font-semibold mb-1">Estadísticas del Grupo</h4>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-1 text-xs">Tipo</th>
                  <th className="border p-1 text-xs">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const stats = calculatePrivileges(groupData.publishers);
                  return (
                    <>
                      <tr>
                        <td className="border p-1 font-semibold">Ancianos</td>
                        <td className="border p-1 text-center">{stats.elders}</td>
                      </tr>
                      <tr>
                        <td className="border p-1 font-semibold">Siervos Ministeriales</td>
                        <td className="border p-1 text-center">{stats.ministerialServants}</td>
                      </tr>
                      <tr>
                        <td className="border p-1 font-semibold">Publicadores Inactivos</td>
                        <td className="border p-1 text-center">{stats.inactivePublishers}</td>
                      </tr>
                      {/* Quitar bg-gray-50 de estas filas */}
                      <tr>
                        <td className="border p-1 font-semibold">Otras Ovejas</td>
                        <td className="border p-1 text-center">{stats.otherSheep}</td>
                      </tr>
                      <tr>
                        <td className="border p-1 font-semibold">Ungidos</td>
                        <td className="border p-1 text-center">{stats.anointed}</td>
                      </tr>
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Averages table component
const AveragesTable = ({ totals }: AveragesTableProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-base font-bold bg-black text-white p-2 text-center mb-2">
        PROMEDIOS TOTALES DEL MES DE
      </h2>
      
      {/* Publicadores No Bautizados */}
      <div className="mb-1">
        <h3 className="font-semibold bg-black text-white p-1 text-sm text-center">
          Publicadores No Bautizados
        </h3>
        <table className="w-full border text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-1 font-semibold">Informaron</td>
              <td className="border border-black p-1 text-center w-28">0</td>
              <td className="border border-black p-1 text-center w-28">Promedio</td>
              <td className="border border-black p-1 text-center w-28">0%</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-semibold">Cursos</td>
              <td className="border border-black p-1 text-center">0</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">0.00</td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border border-black p-1 font-semibold">Total de Publicadores No Bautizados</td>
              <td className="border border-black p-1 text-center" colSpan={1}>0</td>
              <td className="border border-black p-1 text-center" colSpan={2}></td>
            </tr>
          </tbody>
        </table>
            </div>

            {/* Publicadores */}
            <div className="mb-1">
        <h3 className="font-semibold bg-black text-white p-1 text-sm text-center">
          Publicadores
        </h3>
        <table className="w-full border text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-1 font-semibold">Informaron</td>
              <td className="border border-black p-1 text-center w-28">0</td>
              <td className="border border-black p-1 text-center w-28">Promedio</td>
              <td className="border border-black p-1 text-center w-28">0%</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-semibold">Cursos</td>
              <td className="border border-black p-1 text-center">0</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">0.00</td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border border-black p-1 font-semibold">Total de Publicadores</td>
              <td className="border border-black p-1 text-center" colSpan={1}>0</td>
              <td className="border border-black p-1 text-center" colSpan={2}></td>
            </tr>
          </tbody>
        </table>
            </div>

            {/* Precursores Auxiliares */}
            <div className="mb-1">
        <h3 className="font-semibold bg-black text-white p-1 text-sm text-center">
          Precursores Auxiliares
        </h3>
        <table className="w-full border text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-1 font-semibold">Informaron</td>
              <td className="border border-black p-1 text-center w-28">0</td>
              <td className="border border-black p-1 text-center w-28">Promedio</td>
              <td className="border border-black p-1 text-center w-28">0%</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-semibold">Horas</td>
              <td className="border border-black p-1 text-center">0</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">0.00</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-semibold">Cursos</td>
              <td className="border border-black p-1 text-center">0</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">0.00</td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border border-black p-1 font-semibold">Total de Precursores Auxiliares</td>
              <td className="border border-black p-1 text-center" colSpan={1}>0</td>
              <td className="border border-black p-1 text-center" colSpan={2}></td>
            </tr>
          </tbody>
        </table>
            </div>

      {/* Precursores Regulares */}
      <div className="mb-1">
        <h3 className="font-semibold bg-black text-white p-1 text-sm text-center">
          Precursores Regulares
        </h3>
        <table className="w-full border text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-1 font-semibold">Informaron</td>
              <td className="border border-black p-1 text-center w-28">0</td>
              <td className="border border-black p-1 text-center w-28">Promedio</td>
              <td className="border border-black p-1 text-center w-28">0%</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-semibold">Horas</td>
              <td className="border border-black p-1 text-center">0</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">0.00</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-semibold">Cursos</td>
              <td className="border border-black p-1 text-center">0</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">0</td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border border-black p-1 font-semibold">Total de Precursores Regulares</td>
              <td className="border border-black p-1 text-center" colSpan={1}>0</td>
              <td className="border border-black p-1 text-center" colSpan={2}></td>
            </tr>
          </tbody>
        </table>
            </div>

            {/* Precursores Especiales */}
            <div className="mb-1">
        <h3 className="font-semibold bg-black text-white p-1 text-sm text-center">
          Precursores Especiales
        </h3>
        <table className="w-full border text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-1 font-semibold">Informaron</td>
              <td className="border border-black p-1 text-center w-28">0</td>
              <td className="border border-black p-1 text-center w-28">Promedio</td>
              <td className="border border-black p-1 text-center w-28">0%</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-semibold">Horas</td>
              <td className="border border-black p-1 text-center">0</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">0.00</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-semibold">Cursos</td>
              <td className="border border-black p-1 text-center">0</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">0.00</td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border border-black p-1 font-semibold">Total de Precursores Especiales</td>
              <td className="border border-black p-1 text-center" colSpan={1}>0</td>
              <td className="border border-black p-1 text-center" colSpan={2}></td>
            </tr>
          </tbody>
        </table>
            </div>

            {/* Misioneros */}
            <div className="mb-1">
        <h3 className="font-semibold bg-black text-white p-1 text-sm text-center">
          Misioneros
        </h3>
        <table className="w-full border text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-1 font-semibold">Informaron</td>
              <td className="border border-black p-1 text-center w-28">0</td>
              <td className="border border-black p-1 text-center w-28">Promedio</td>
              <td className="border border-black p-1 text-center w-28">0.00%</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-semibold">Horas</td>
              <td className="border border-black p-1 text-center">0</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">0.00</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-semibold">Cursos</td>
              <td className="border border-black p-1 text-center">0</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">0.00</td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border border-black p-1 font-semibold">Total de Misioneros</td>
              <td className="border border-black p-1 text-center" colSpan={1}>0</td>
              <td className="border border-black p-1 text-center" colSpan={2}></td>
            </tr>
          </tbody>
        </table>
            </div>

      {/* Siervos Especiales */}
      <div className="mb-1">
        <h3 className="font-semibold bg-black text-white p-1 text-sm text-center">
          Siervos Especiales de Tiempo Completo / Voluntarios
        </h3>
        <table className="w-full border text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Superintendentes de Circuito</td>
              <td className="border border-black p-1 text-center w-[42%]">0</td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Betelitas</td>
              <td className="border border-black p-1 text-center w-[42%]">0</td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Siervos de construcción</td>
              <td className="border border-black p-1 text-center w-[42%]">0</td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Instructores de Escuelas Teocráticas</td>
              <td className="border border-black p-1 text-center w-[42%]">0</td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Voluntarios A-2</td>
              <td className="border border-black p-1 text-center w-[42%]">0</td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Voluntarios A-19</td>
              <td className="border border-black p-1 text-center w-[42%]">0</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div className="mb-1">
        <h3 className="font-semibold bg-black text-white p-1 text-sm text-center">
          Totales
        </h3>
        <table className="w-full border text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Otras Ovejas</td>
              <td className="border border-black p-1 text-center w-[42%]">0</td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Ungidos</td>
              <td className="border border-black p-1 text-center w-[42%]">0</td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Siervos Ministeriales</td>
              <td className="border border-black p-1 text-center w-[42%]">0</td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Ancianos</td>
              <td className="border border-black p-1 text-center w-[42%]">0</td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Publicadores Activos</td>
              <td className="border border-black p-1 text-center w-[42%]">0</td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Publicadores Inactivos del mes</td>
              <td className="border border-black p-1 text-center w-[42%]">0</td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Total de Publicadores de la Congregación</td>
              <td className="border border-black p-1 text-center w-[42%]">0</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Congregación */}
      <div className="text-center bg-black text-white p-1 text-sm">
        <div>Congregación</div>
        <div></div>
      </div>
    </div>
  );
};

export default ServiceReportAssistant;
