import React, { useState, useEffect } from 'react';
import { Save, Trash2, FileText, Download, Calendar, Home, Menu, X } from 'lucide-react';
import { calculateTotals, calculateGroupTotals, formatNumber, formatPercentage, Totals, Publisher, GroupData, initializeTotals } from '../utils/calculators';

type ActiveGroupType = number | 'averages';

interface GroupTableProps {
  groupNumber: number;
  groupData: GroupData;
  addPublisher: () => void;
  updatePublisher: (index: number, field: keyof Publisher, value: any) => void;
  removePublisher: (index: number) => void;
  savePublisher: (index: number) => void;
  toggleEditPublisher: (index: number) => void;
  updateGroupLeader: (field: 'superintendent' | 'assistant', value: string) => void;
}

interface AveragesTableProps {
  totals: Totals;
  currentMonth: number;
  currentYear: number;
}

// Mover la función createEmptyMonthData antes del componente
const createEmptyMonthData = (): Record<number, GroupData> => {
  const data: Record<number, GroupData> = {};
  
  for (let i = 1; i <= 10; i++) {
    data[i] = {
      publishers: [],
      superintendent: '',
      assistant: ''
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
  const [totals, setTotals] = useState<Totals>(initializeTotals());
  const [monthlyData, setMonthlyData] = useState<Record<string, Record<number, GroupData>>>({});
  const [availableMonths, setAvailableMonths] = useState<Array<{key: string; year: number; month: number}>>([]);
  const [isNavOpen, setIsNavOpen] = useState(() => {
    const saved = localStorage.getItem('navPreference');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('navPreference', JSON.stringify(isNavOpen));
  }, [isNavOpen]);

  const [isPanelPinned, setIsPanelPinned] = useState(true);

  const [isDesktopPanelExpanded, setIsDesktopPanelExpanded] = useState(true);
  
  useEffect(() => {
    const loadInitialData = () => {
      const initialMonthlyData: Record<string, Record<number, GroupData>> = {};
      
      const currentDate = new Date();
      const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
      
      const prevDate = new Date();
      prevDate.setMonth(prevDate.getMonth() - 1);
      const prevMonthKey = `${prevDate.getFullYear()}-${prevDate.getMonth()}`;
      
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const twoMonthsAgoKey = `${twoMonthsAgo.getFullYear()}-${twoMonthsAgo.getMonth()}`;
      
      initialMonthlyData[currentMonthKey] = createEmptyMonthData();
      initialMonthlyData[prevMonthKey] = createEmptyMonthData();
      initialMonthlyData[twoMonthsAgoKey] = createEmptyMonthData();
      
      const monthsList = [
        { key: currentMonthKey, year: currentDate.getFullYear(), month: currentDate.getMonth() },
        { key: prevMonthKey, year: prevDate.getFullYear(), month: prevDate.getMonth() },
        { key: twoMonthsAgoKey, year: twoMonthsAgo.getFullYear(), month: twoMonthsAgo.getMonth() }
      ];
      
      setMonthlyData(initialMonthlyData);
      setAvailableMonths(monthsList);
      
      setGroupData(initialMonthlyData[currentMonthKey]);
    };
    
    loadInitialData();
  }, []);

  // Efecto para calcular totales
  useEffect(() => {
    if (Object.keys(groupData).length > 0) {
      const groups = Object.values(groupData);
      const calculatedTotals = calculateTotals(groups);
      setTotals(calculatedTotals);
    }
  }, [groupData]);

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
      isEditing: true,
      isNew: true
    });
    setGroupData(updatedGroupData);
    
    const monthKey = `${currentYear}-${currentMonth}`;
    const updatedMonthlyData = {...monthlyData};
    updatedMonthlyData[monthKey] = updatedGroupData;
    setMonthlyData(updatedMonthlyData);
  };

  const updatePublisher = (index: number, field: keyof Publisher, value: any) => {
    setGroupData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (newData[activeGroup]?.publishers?.[index]) {
        if (field === 'serviceType' && value === 'unbaptizedPublisher') {
          newData[activeGroup].publishers[index].privilege = '';
          newData[activeGroup].publishers[index].specialServants = '';
          newData[activeGroup].publishers[index].hope = 'otherSheep';
        }

        if (field === 'hope' && 
            value === 'anointed' && 
            newData[activeGroup].publishers[index].serviceType === 'unbaptizedPublisher') {
          console.warn('Los publicadores no bautizados no pueden ser ungidos');
          value = 'otherSheep';
        }

        if (field === 'participation' && value === 'inactive') {
          newData[activeGroup].publishers[index].hours = 0;
          newData[activeGroup].publishers[index].courses = 0;
        }

        newData[activeGroup].publishers[index][field] = value;
        
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

  const removePublisher = (index: number) => {
    if (typeof activeGroup !== 'number') {
      console.error('Active group must be a number.');
      return;
    }

    if (!window.confirm('¿Está seguro que desea eliminar este publicador?')) {
      return;
    }

    const updatedGroupData = { ...groupData };
    updatedGroupData[activeGroup].publishers.splice(index, 1);
    setGroupData(updatedGroupData);

    const monthKey = `${currentYear}-${currentMonth}`;
    const updatedMonthlyData = { ...monthlyData };
    updatedMonthlyData[monthKey] = updatedGroupData;
    setMonthlyData(updatedMonthlyData);
  };

  const clearGroupData = () => {
    if (typeof activeGroup !== 'number') {
      console.error('Active group must be a number.');
      return;
    }
    const updatedGroupData = { ...groupData };
    updatedGroupData[activeGroup].publishers = [];
    setGroupData(updatedGroupData);

    const monthKey = `${currentYear}-${currentMonth}`;
    const updatedMonthlyData = { ...monthlyData };
    updatedMonthlyData[monthKey] = updatedGroupData;
    setMonthlyData(updatedMonthlyData);
  };

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

    const monthKey = `${currentYear}-${currentMonth}`;
    const updatedMonthlyData = { ...monthlyData };
    updatedMonthlyData[monthKey] = updatedGroupData;
    setMonthlyData(updatedMonthlyData);
  };

  const createNewMonth = () => {
    const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const newMonthKey = `${newYear}-${newMonth}`;
    
    if (monthlyData[newMonthKey]) {
      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
      setGroupData(monthlyData[newMonthKey]);
      return;
    }
    
    const currentMonthKey = `${currentYear}-${currentMonth}`;
    const updatedMonthlyData = {...monthlyData};
    updatedMonthlyData[currentMonthKey] = {...groupData};
    
    const newMonthData = JSON.parse(JSON.stringify(groupData));
    for (let group in newMonthData) {
      newMonthData[group].publishers.forEach((publisher: Publisher) => {
        publisher.hours = 0;
        publisher.courses = 0;
        publisher.notes = '';
      });
    }
    
    updatedMonthlyData[newMonthKey] = newMonthData;
    
    const updatedMonths = [
      ...availableMonths,
      { key: newMonthKey, year: newYear, month: newMonth }
    ].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    
    setMonthlyData(updatedMonthlyData);
    setAvailableMonths(updatedMonths);
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setGroupData(newMonthData);
  };
  
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

  const exportToPdf = (groupNumber: number | 'averages') => {
    alert(`Exporting Group ${groupNumber} to PDF`);
  };

  const exportAveragesToPdf = () => {
    alert('Exporting averages to PDF');
  };

  const exportAllToPdf = () => {
    alert('Exporting all groups to PDF');
  };

  const navigateToGroup = (groupNumber: ActiveGroupType) => {
    if (typeof groupNumber === 'number' && (groupNumber < 1 || groupNumber > 10)) {
      console.error('Número de grupo inválido');
      return;
    }
    setActiveGroup(groupNumber);
  };

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

        publisher.isEditing = false;
        publisher.isNew = false;

        const monthKey = `${currentYear}-${currentMonth}`;
        setMonthlyData(prevMonthlyData => ({
          ...prevMonthlyData,
          [monthKey]: newData
        }));
      }
      return newData;
    });
  };

  const updateGroupLeader = (field: 'superintendent' | 'assistant', value: string) => {
    setGroupData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (newData[activeGroup]) {
        newData[activeGroup][field] = value;
        
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
      <header className="bg-black text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Service Report Assistant</h1>
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
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
              onClick={createNewMonth}
            >
              <Calendar className="mr-2" size={18} />
              Nuevo Mes
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav 
          className={`
            fixed md:relative inset-y-0 left-0 bg-black 
            transform transition-all duration-300 ease-in-out z-40
            ${isNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            ${isDesktopPanelExpanded ? 'w-60' : 'w-12'}
            hidden md:block
          `}
        >
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

          <div className={`${isDesktopPanelExpanded ? 'px-4' : 'px-2'}`}>
            <h2 className={`
              text-lg text-white font-semibold mb-4 transition-opacity duration-300
              ${isDesktopPanelExpanded ? 'opacity-100' : 'opacity-0 hidden'}
            `}>
              Navegación
            </h2>
            <ul className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <li key={i}>
                  <button 
                    className={`
                      w-full rounded flex items-center justify-${isDesktopPanelExpanded ? 'start' : 'center'} p-2
                      ${activeGroup === i+1 ? 'bg-blue-600 text-white' : 'bg-black text-white hover:bg-gray-300 hover:text-black'}
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

              <li className="border-t border-gray-300 my-2"></li>

              <li>
                <button 
                  className={`
                    w-full rounded flex items-center justify-${isDesktopPanelExpanded ? 'start' : 'center'} p-2
                    ${activeGroup === 'averages' ? 'bg-blue-600 text-white' : 'bg-black text-white hover:bg-gray-300 hover:text-black'}
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

              <li className="border-t border-gray-300 my-2"></li>

              <li>
                <button 
                  className={`w-full rounded flex items-center justify-${isDesktopPanelExpanded ? 'start' : 'center'} p-2 bg-black text-white hover:bg-gray-300 hover:text-black`}
                  onClick={() => exportAllToPdf()}
                  title={!isDesktopPanelExpanded ? "Exportar todo" : ''}
                >
                  <Download size={18} />
                  {isDesktopPanelExpanded && <span className="ml-2">Exportar Todo a PDF</span>}
                </button>
              </li>
              {typeof activeGroup === 'number' && (
                <li>
                  <button 
                    className={`w-full rounded flex items-center justify-${isDesktopPanelExpanded ? 'start' : 'center'} p-2 bg-black text-white hover:bg-gray-300 hover:text-black`}
                    onClick={() => exportToPdf(activeGroup)}
                    title={!isDesktopPanelExpanded ? "Exportar grupo actual" : ''}
                  >
                    <Download size={18} />
                    {isDesktopPanelExpanded && <span className="ml-2">Exportar Grupo Actual</span>}
                  </button>
                </li>
              )}
              {typeof activeGroup === 'string' && (
                <li>
                  <button 
                    className={`w-full rounded flex items-center justify-${isDesktopPanelExpanded ? 'start' : 'center'} p-2 bg-black text-white hover:bg-gray-300 hover:text-black`}
                    onClick={() => exportAveragesToPdf()}
                    title={!isDesktopPanelExpanded ? "Exportar Promedios" : ''}
                  >
                    <Download size={18} />
                    {isDesktopPanelExpanded && <span className="ml-2">Exportar Promedios</span>}
                  </button>
                </li>
              )}
            </ul>
          </div>
        </nav>

        <div className="md:hidden">
          {!isNavOpen && (
            <button
              className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 hover:text-black"
              onClick={() => setIsNavOpen(true)}
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        <main className={`
          flex-1 p-4 overflow-y-auto transition-all duration-300
          ${isDesktopPanelExpanded ? 'md:ml-15' : 'md:ml-5'}
        `}>
          {activeGroup === 'averages' ? (
            <AveragesTable totals={totals} currentMonth={currentMonth} currentYear={currentYear} />
          ) : (
            <GroupTable 
              groupNumber={activeGroup}
              groupData={groupData[activeGroup]} 
              addPublisher={addPublisher}
              updatePublisher={updatePublisher}
              removePublisher={removePublisher}
              savePublisher={savePublisher}
              toggleEditPublisher={toggleEditPublisher}
              updateGroupLeader={updateGroupLeader}
            />
          )}
        </main>
      </div>
    </div>
  );
};

const GroupTable = ({ 
  groupNumber, 
  groupData, 
  addPublisher, 
  updatePublisher, 
  removePublisher,
  savePublisher,
  toggleEditPublisher,
  updateGroupLeader
}: GroupTableProps) => {
  const isUnbaptizedPublisher = (publisher: Publisher): boolean => {
    return publisher.serviceType === 'unbaptizedPublisher';
  };

  const isRegularPublisher = (publisher: Publisher): boolean => {
    return publisher.serviceType === 'publisher' || 
          publisher.serviceType === 'unbaptizedPublisher';
  };

  const isInactive = (publisher: Publisher): boolean => {
    return publisher.participation === 'inactive';
  };

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
      if (pub.isEditing || pub.isNew) return;

      if (pub.serviceType && pub.serviceType in summary) {
        if (pub.participation === 'active') {
          summary[pub.serviceType as keyof typeof summary].informes++;
          
          if (!isRegularPublisher(pub)) {
            summary[pub.serviceType as keyof typeof summary].horas += (pub.hours || 0);
          }
          
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
      if (pub.isEditing || pub.isNew) return;

      if (pub.specialServants && pub.specialServants in counts) {
        counts[pub.specialServants as keyof typeof counts]++;
      }
    });
  
    return counts;
  };

  const calculatePrivileges = (publishers: Publisher[]) => {
    const counts = {
      elders: 0,
      ministerialServants: 0,
      inactivePublishers: 0,
      otherSheep: 0,
      anointed: 0
    };
  
    publishers.forEach(pub => {
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
      if (pub.hope === 'otherSheep') {
        counts.otherSheep++;
      }
      if (pub.hope === 'anointed') {
        counts.anointed++;
      }
    });
  
    return counts;
  };

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

  const getGroupColor = (groupNumber: number): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-indigo-500',
      'bg-orange-500',
      'bg-pink-300',
      'bg-purple-500',
      'bg-teal-500'
    ];
    return colors[groupNumber - 1] || 'bg-gray-500';
  };

  return (
    <div>
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
              <th className="border border-black p-1 text-xs">Publicadores</th>
              <th className="border border-black p-1 text-xs w-56">Tipo de Servicio</th>
              <th className="border border-black p-1 text-xs">Participación</th>
              <th className="border border-black p-1 text-xs w-20">Horas</th>
              <th className="border border-black p-1 text-xs w-20">Cursos</th>
              <th className="border border-black p-1 text-xs">Notas</th>
              <th className="border border-black p-1 text-xs">Privilegio</th>
              <th className="border border-black p-1 text-xs">Siervos Especiales / Voluntarios</th>
              <th className="border border-black p-1 text-xs w-40">Esperanza</th>
              <th className="border border-black p-1 text-xs w-10">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {groupData.publishers.map((publisher, index) => (
              <tr key={index} className={`hover:bg-gray-50 ${publisher.isEditing ? 'bg-blue-50' : ''}`}>
                <td className="border border-black  p-1">
                  <input 
                    type="text" 
                    className={`w-full p-1 border border-black rounded text-sm ${!publisher.name && publisher.isEditing ? 'border-red-500' : ''}`}
                    value={publisher.name || ''}
                    onChange={(e) => updatePublisher(index, 'name', e.target.value)}
                    disabled={!publisher.isEditing}
                    placeholder={publisher.isEditing ? "Nombre*" : ""}
                  />
                </td>
                <td className="border border-black p-1">
                  <select 
                    className={`w-full p-1 border border-black rounded text-center text-sm ${!publisher.serviceType && publisher.isEditing ? 'border-red-500' : ''}`}
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
                <td className="border border-black p-1">
                  <select 
                    className="w-full p-1 border border-black rounded text-center text-sm"
                    value={publisher.participation || ''}
                    onChange={(e) => updatePublisher(index, 'participation', e.target.value)}
                    disabled={!publisher.isEditing}
                  >
                    <option value="">Seleccionar</option>
                    <option value="active">Sí</option>
                    <option value="inactive">No</option>
                  </select>
                </td>
                <td className="border border-black p-1 w-20">
                  <input 
                    type="number" 
                    className="w-full p-1 border border-black rounded text-center text-sm"
                    value={publisher.hours || 0}
                    onChange={(e) => updatePublisher(index, 'hours', parseInt(e.target.value) || 0)}
                    min="0"
                    disabled={isRegularPublisher(publisher) || isInactive(publisher) || !publisher.isEditing}
                  />
                </td>
                <td className="border border-black p-1 w-20">
                  <input 
                    type="number" 
                    className="w-full p-1 border border-black rounded text-center text-sm"
                    value={publisher.courses || 0}
                    onChange={(e) => updatePublisher(index, 'courses', parseInt(e.target.value) || 0)}
                    min="0"
                    disabled={isInactive(publisher) || !publisher.isEditing}
                  />
                </td>
                <td className="border border-black p-1">
                  <input 
                    type="text" 
                    className="w-full p-1 border border-black rounded text-sm"
                    value={publisher.notes || ''}
                    onChange={(e) => updatePublisher(index, 'notes', e.target.value)}
                    disabled={!publisher.isEditing}
                  />
                </td>
                <td className="border border-black p-1">
                  <select 
                    className="w-full p-1 border border-black rounded text-center text-sm"
                    value={publisher.privilege || ''}
                    onChange={(e) => updatePublisher(index, 'privilege', e.target.value)}
                    disabled={isUnbaptizedPublisher(publisher) || !publisher.isEditing}
                  >
                    <option value=""></option>
                    <option value="ministerialServant">Siervo Ministerial</option>
                    <option value="elder">Anciano</option>
                  </select>
                </td>

                <td className="border border-black p-1">
                  <select 
                    className="w-full p-1 border border-black rounded text-center text-sm"
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
                <td className="border border-black p-1">
                  <select 
                    className={`w-full p-1 border border-black rounded text-center text-sm ${!publisher.hope && publisher.isEditing ? 'border-red-500' : ''}`}
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
                <td className="border border-black p-1">
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
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4">
        <h3 className="text-base font-bold mb-2">Resumen del Grupo</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white p-2 rounded border border-black shadow">
            <h4 className="text-sm font-semibold mb-1">Informes por Tipo de Publicador</h4>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-blue-100">
                  <th className="border border-black p-1 text-xs">Tipo</th>
                  <th className="border border-black p-1 text-xs">Total</th>
                  <th className="border border-black p-1 text-xs">Informaron</th>
                  <th className="border border-black p-1 text-xs">Horas</th>
                  <th className="border border-black p-1 text-xs">Cursos</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const summary = calculateSummary(groupData.publishers);
                  const totals = calculatePublisherTotals(groupData.publishers);
                  
                  return Object.entries(summary).map(([type, data]) => (
                    <tr key={type}>
                      <td className="border border-black p-1">
                        {type === 'unbaptizedPublisher' ? 'Publicadores No Bautizados' :
                        type === 'publisher' ? 'Publicadores' :
                        type === 'auxiliarPioneer' ? 'Precursores Auxiliares' :
                        type === 'regularPioneer' ? 'Precursores Regulares' :
                        type === 'specialPioneer' ? 'Precursores Especiales' :
                        'Misioneros'}
                      </td>
                      <td className="border border-black p-1 text-center">
                        {type === 'unbaptizedPublisher' ? totals.unbaptizedPublishers :
                        type === 'publisher' ? totals.baptizedPublishers :
                        type === 'auxiliarPioneer' ? totals.auxiliarPioneers :
                        type === 'regularPioneer' ? totals.regularPioneers :
                        type === 'specialPioneer' ? totals.specialPioneers :
                        totals.missionaries}
                      </td>
                      <td className="border border-black p-1 text-center">{data.informes}</td>
                      <td className="border border-black p-1 text-center">
                        {isRegularPublisher({serviceType: type} as Publisher) ? '-' : data.horas}
                      </td>
                      <td className="border border-black p-1 text-center">{data.cursos}</td>
                    </tr>
                  ));
                })()}
                <tr className="bg-gray-50 font-semibold">
                  <td className="border border-black p-1">Total General</td>
                  <td className="border border-black p-1 text-center">
                    {groupData.publishers.filter(p => !p.isEditing && !p.isNew).length}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {groupData.publishers
                      .filter(p => !p.isEditing && !p.isNew && p.participation === 'active')
                      .length}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {groupData.publishers
                      .filter(p => !p.isEditing && !p.isNew)
                      .reduce((sum, p) => sum + (isRegularPublisher(p) ? 0 : (p.hours || 0)), 0)}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {groupData.publishers
                      .filter(p => !p.isEditing && !p.isNew)
                      .reduce((sum, p) => sum + (p.courses || 0), 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <div className="bg-white p-2 rounded border border-black shadow">
            <h4 className="text-sm font-semibold mb-1">Siervos Especiales / Voluntarios</h4>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-blue-100">
                  <th className="border border-black p-1 text-xs">Tipo</th>
                  <th className="border border-black p-1 text-xs">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(calculateSpecialServants(groupData.publishers)).map(([type, count]) => (
                  <tr key={type}>
                    <td className="border border-black p-1">
                      {type === 'circuitOverseer' ? 'Superintendentes de Circuito' :
                      type === 'bethelite' ? 'Betelitas' :
                      type === 'construction' ? 'Siervos de construcción' :
                      type === 'instructor' ? 'Instructores de Escuelas Teocráticas' :
                      type === 'volunteerA2' ? 'Voluntarios A-2' :
                      type === 'volunteerA19' ? 'Voluntarios A-19' :
                      'Voluntarios A-2 & A-19'}
                    </td>
                    <td className="border border-black text-center p-1">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white p-2 rounded border border-black shadow">
            <h4 className="text-sm font-semibold mb-1">Estadísticas del Grupo</h4>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-blue-100">
                  <th className="border border-black p-1 text-xs">Tipo</th>
                  <th className="border border-black p-1 text-xs">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const stats = calculatePrivileges(groupData.publishers);
                  return (
                    <>
                      <tr>
                        <td className="border border-black p-1">Ancianos</td>
                        <td className="border border-black p-1 text-center">{stats.elders}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1">Siervos Ministeriales</td>
                        <td className="border border-black p-1 text-center">{stats.ministerialServants}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1">Publicadores Inactivos del mes</td>
                        <td className="border border-black p-1 text-center">{stats.inactivePublishers}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1">Otras Ovejas</td>
                        <td className="border border-black p-1 text-center">{stats.otherSheep}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1">Ungidos</td>
                        <td className="border border-black p-1 text-center">{stats.anointed}</td>
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

const AveragesTable = ({ totals, currentMonth, currentYear }: AveragesTableProps) => {
  const getMonthName = (monthIndex: number): string => {
    const months = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    return months[monthIndex] || '';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-base font-bold bg-black text-white p-2 text-center mb-2">
        PROMEDIOS TOTALES DEL MES DE {getMonthName(currentMonth)} {currentYear}
      </h2>
      
      {/* Publicadores No Bautizados */}
      <div className="mb-1">
        <h3 className="font-bold bg-black text-white p-1 text-sm text-center">
          Publicadores No Bautizados
        </h3>
        <table className="w-full border text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-1">Informaron</td>
              <td className="border border-black p-1 text-center w-28">{totals.unbaptizedPublishers.informes}</td>
              <td className="border border-black p-1 text-center w-28">Promedio</td>
              <td className="border border-black p-1 text-center w-28">
                {formatPercentage(totals.unbaptizedPublishers.informes, totals.unbaptizedPublishers.total)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1">Cursos</td>
              <td className="border border-black p-1 text-center">{totals.unbaptizedPublishers.cursos}</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">
                {formatNumber(totals.unbaptizedPublishers.promedioCursos)}
              </td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border border-black p-1">Total de Publicadores No Bautizados</td>
              <td className="border border-black p-1 text-center" colSpan={1}>
                {totals.unbaptizedPublishers.total}
              </td>
              <td className="border border-black p-1 text-center" colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Publicadores */}
      <div className="mb-1">
        <h3 className="font-bold bg-black text-white p-1 text-sm text-center">
          Publicadores
        </h3>
        <table className="w-full border text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-1">Informaron</td>
              <td className="border border-black p-1 text-center w-28">{totals.publishers.informes}</td>
              <td className="border border-black p-1 text-center w-28">Promedio</td>
              <td className="border border-black p-1 text-center w-28">
                {formatPercentage(totals.publishers.informes, totals.publishers.total)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1">Cursos</td>
              <td className="border border-black p-1 text-center">{totals.publishers.cursos}</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">
                {formatNumber(totals.publishers.promedioCursos)}
              </td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border border-black p-1">Total de Publicadores</td>
              <td className="border border-black p-1 text-center" colSpan={1}>
                {totals.publishers.total}
              </td>
              <td className="border border-black p-1 text-center" colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Precursores Auxiliares */}
      <div className="mb-1">
        <h3 className="font-bold bg-black text-white p-1 text-sm text-center">
          Precursores Auxiliares
        </h3>
        <table className="w-full border text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-1">Informaron</td>
              <td className="border border-black p-1 text-center w-28">{totals.auxiliarPioneers.informes}</td>
              <td className="border border-black p-1 text-center w-28">Promedio</td>
              <td className="border border-black p-1 text-center w-28">
                {formatPercentage(totals.auxiliarPioneers.informes, totals.auxiliarPioneers.total)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1">Horas</td>
              <td className="border border-black p-1 text-center">{totals.auxiliarPioneers.horas}</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">
                {formatNumber(totals.auxiliarPioneers.promedioHoras)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1">Cursos</td>
              <td className="border border-black p-1 text-center">{totals.auxiliarPioneers.cursos}</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">
                {formatNumber(totals.auxiliarPioneers.promedioCursos)}
              </td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border border-black p-1">Total de Precursores Auxiliares</td>
              <td className="border border-black p-1 text-center" colSpan={1}>
                {totals.auxiliarPioneers.total}
              </td>
              <td className="border border-black p-1 text-center" colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Precursores Regulares */}
      <div className="mb-1">
        <h3 className="font-bold bg-black text-white p-1 text-sm text-center">
          Precursores Regulares
        </h3>
        <table className="w-full border text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-1">Informaron</td>
              <td className="border border-black p-1 text-center w-28">{totals.regularPioneers.informes}</td>
              <td className="border border-black p-1 text-center w-28">Promedio</td>
              <td className="border border-black p-1 text-center w-28">
                {formatPercentage(totals.regularPioneers.informes, totals.regularPioneers.total)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1">Horas</td>
              <td className="border border-black p-1 text-center">{totals.regularPioneers.horas}</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">
                {formatNumber(totals.regularPioneers.promedioHoras)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1">Cursos</td>
              <td className="border border-black p-1 text-center">{totals.regularPioneers.cursos}</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">
                {formatNumber(totals.regularPioneers.promedioCursos)}
              </td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border border-black p-1">Total de Precursores Regulares</td>
              <td className="border border-black p-1 text-center" colSpan={1}>
                {totals.regularPioneers.total}
              </td>
              <td className="border border-black p-1 text-center" colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Precursores Especiales */}
      <div className="mb-1">
        <h3 className="font-bold bg-black text-white p-1 text-sm text-center">
          Precursores Especiales
        </h3>
        <table className="w-full border text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-1">Informaron</td>
              <td className="border border-black p-1 text-center w-28">{totals.specialPioneers.informes}</td>
              <td className="border border-black p-1 text-center w-28">Promedio</td>
              <td className="border border-black p-1 text-center w-28">
                {formatPercentage(totals.specialPioneers.informes, totals.specialPioneers.total)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1">Horas</td>
              <td className="border border-black p-1 text-center">{totals.specialPioneers.horas}</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">
                {formatNumber(totals.specialPioneers.promedioHoras)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1">Cursos</td>
              <td className="border border-black p-1 text-center">{totals.specialPioneers.cursos}</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">
                {formatNumber(totals.specialPioneers.promedioCursos)}
              </td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border border-black p-1">Total de Precursores Especiales</td>
              <td className="border border-black p-1 text-center" colSpan={1}>
                {totals.specialPioneers.total}
              </td>
              <td className="border border-black p-1 text-center" colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Misioneros */}
      <div className="mb-1">
        <h3 className="font-bold bg-black text-white p-1 text-sm text-center">
          Misioneros
        </h3>
        <table className="w-full border text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-1">Informaron</td>
              <td className="border border-black p-1 text-center w-28">{totals.missionaries.informes}</td>
              <td className="border border-black p-1 text-center w-28">Promedio</td>
              <td className="border border-black p-1 text-center w-28">
                {formatPercentage(totals.missionaries.informes, totals.missionaries.total)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1">Horas</td>
              <td className="border border-black p-1 text-center">{totals.missionaries.horas}</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">
                {formatNumber(totals.missionaries.promedioHoras)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1">Cursos</td>
              <td className="border border-black p-1 text-center">{totals.missionaries.cursos}</td>
              <td className="border border-black p-1 text-center">Promedio</td>
              <td className="border border-black p-1 text-center">
                {formatNumber(totals.missionaries.promedioCursos)}
              </td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border border-black p-1">Total de Misioneros</td>
              <td className="border border-black p-1 text-center" colSpan={1}>
                {totals.missionaries.total}
              </td>
              <td className="border border-black p-1 text-center" colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Siervos Especiales */}
      <div className="mb-1">
        <h3 className="font-bold bg-black text-white p-1 text-sm text-center">
          Siervos Especiales de Tiempo Completo / Voluntarios
        </h3>
        <table className="w-full border text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Superintendentes de Circuito</td>
              <td className="border border-black p-1 text-center w-[42%]">
                {totals.specialServants.circuitOverseer}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Betelitas</td>
              <td className="border border-black p-1 text-center w-[42%]">
                {totals.specialServants.bethelite}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Siervos de construcción</td>
              <td className="border border-black p-1 text-center w-[42%]">
                {totals.specialServants.construction}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Instructores de Escuelas Teocráticas</td>
              <td className="border border-black p-1 text-center w-[42%]">
                {totals.specialServants.instructor}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Voluntarios A-2</td>
              <td className="border border-black p-1 text-center w-[42%]">
                {totals.specialServants.volunteerA2}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Voluntarios A-19</td>
              <td className="border border-black p-1 text-center w-[42%]">
                {totals.specialServants.volunteerA19}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div className="mb-1">
        <h3 className="font-bold bg-black text-white p-1 text-sm text-center">
          Totales
        </h3>
        <table className="w-full border text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Otras Ovejas</td>
              <td className="border border-black p-1 text-center w-[42%]">
                {totals.otherStats.otherSheep}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Ungidos</td>
              <td className="border border-black p-1 text-center w-[42%]">
                {totals.otherStats.anointed}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Siervos Ministeriales</td>
              <td className="border border-black p-1 text-center w-[42%]">
                {totals.privileges.ministerialServants}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Ancianos</td>
              <td className="border border-black p-1 text-center w-[42%]">
                {totals.privileges.elders}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Publicadores Activos</td>
              <td className="border border-black p-1 text-center w-[42%]">
                {totals.otherStats.activePublishers}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Publicadores Inactivos del mes</td>
              <td className="border border-black p-1 text-center w-[42%]">
                {totals.otherStats.inactivePublishers}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 w-[62.5%]">Total de Publicadores de la Congregación</td>
              <td className="border border-black p-1 text-center w-[42%]">
                {totals.otherStats.totalCongregation}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="font-bold text-center bg-black text-white p-1 text-sm">
        <div>Congregación</div>
      </div>
    </div>
  );
};

export default ServiceReportAssistant;
