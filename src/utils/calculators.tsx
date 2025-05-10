export interface Publisher {
    name: string;
    serviceType: 'publisher' | 'unbaptizedPublisher' | 'auxiliarPioneer' | 'regularPioneer' | 'specialPioneer' | 'missionary' | '';
    participation: 'active' | 'inactive' | '';
    hours: number;
    courses: number;
    notes: string;
    privilege: 'elder' | 'ministerialServant' | '';
    specialServants: 'circuitOverseer' | 'bethelite' | 'construction' | 'instructor' | 'volunteerA2' | 'volunteerA19' | 'volunteerA2ToA19' | '';
    hope: 'otherSheep' | 'anointed' | '';
    isEditing: boolean;
    isNew: boolean;
}

export interface GroupData {
    publishers: Publisher[];
    superintendent?: string;
    assistant?: string;
}

export interface Totals {
    unbaptizedPublishers: {
        total: number;
        informes: number;
        cursos: number;
        promedioCursos: number;
    };
    publishers: {
        total: number;
        informes: number;
        cursos: number;
        promedioCursos: number;
    };
    auxiliarPioneers: {
        total: number;
        informes: number;
        horas: number;
        cursos: number;
        promedioHoras: number;
        promedioCursos: number;
    };
    regularPioneers: {
        total: number;
        informes: number;
        horas: number;
        cursos: number;
        promedioHoras: number;
        promedioCursos: number;
    };
    specialPioneers: {
        total: number;
        informes: number;
        horas: number;
        cursos: number;
        promedioHoras: number;
        promedioCursos: number;
    };
    missionaries: {
        total: number;
        informes: number;
        horas: number;
        cursos: number;
        promedioHoras: number;
        promedioCursos: number;
    };
    specialServants: {
        circuitOverseer: number;
        bethelite: number;
        construction: number;
        instructor: number;
        volunteerA2: number;
        volunteerA19: number;
        volunteerA2ToA19: number;
    };
    privileges: {
        elders: number;
        ministerialServants: number;
    };
    otherStats: {
        otherSheep: number;
        anointed: number;
        activePublishers: number;
        inactivePublishers: number;
        totalCongregation: number;
    };
}

export const initializeTotals = (): Totals => ({
    unbaptizedPublishers: { total: 0, informes: 0, cursos: 0, promedioCursos: 0 },
    publishers: { total: 0, informes: 0, cursos: 0, promedioCursos: 0 },
    auxiliarPioneers: { total: 0, informes: 0, horas: 0, cursos: 0, promedioHoras: 0, promedioCursos: 0 },
    regularPioneers: { total: 0, informes: 0, horas: 0, cursos: 0, promedioHoras: 0, promedioCursos: 0 },
    specialPioneers: { total: 0, informes: 0, horas: 0, cursos: 0, promedioHoras: 0, promedioCursos: 0 },
    missionaries: { total: 0, informes: 0, horas: 0, cursos: 0, promedioHoras: 0, promedioCursos: 0 },
    specialServants: {
        circuitOverseer: 0,
        bethelite: 0,
        construction: 0,
        instructor: 0,
        volunteerA2: 0,
        volunteerA19: 0,
        volunteerA2ToA19: 0
    },
    privileges: {
        elders: 0,
        ministerialServants: 0
    },
    otherStats: {
        otherSheep: 0,
        anointed: 0,
        activePublishers: 0,
        inactivePublishers: 0,
        totalCongregation: 0
    }
});

export const calculateTotals = (groups: GroupData[]): Totals => {
    const totals = initializeTotals();

    groups.forEach(group => {
        group.publishers.forEach(pub => {
            if (pub.isEditing || pub.isNew) return;

            // Contar por tipo de publicador
            switch (pub.serviceType) {
                case 'unbaptizedPublisher':
                    totals.unbaptizedPublishers.total++;
                    if (pub.participation === 'active') {
                        totals.unbaptizedPublishers.informes++;
                        totals.unbaptizedPublishers.cursos += pub.courses || 0;
                    }
                    break;
                case 'publisher':
                    totals.publishers.total++;
                    if (pub.participation === 'active') {
                        totals.publishers.informes++;
                        totals.publishers.cursos += pub.courses || 0;
                    }
                    break;
                case 'auxiliarPioneer':
                    totals.auxiliarPioneers.total++;
                    if (pub.participation === 'active') {
                        totals.auxiliarPioneers.informes++;
                        totals.auxiliarPioneers.horas += pub.hours || 0;
                        totals.auxiliarPioneers.cursos += pub.courses || 0;
                    }
                    break;
                case 'regularPioneer':
                    totals.regularPioneers.total++;
                    if (pub.participation === 'active') {
                        totals.regularPioneers.informes++;
                        totals.regularPioneers.horas += pub.hours || 0;
                        totals.regularPioneers.cursos += pub.courses || 0;
                    }
                    break;
                case 'specialPioneer':
                    totals.specialPioneers.total++;
                    if (pub.participation === 'active') {
                        totals.specialPioneers.informes++;
                        totals.specialPioneers.horas += pub.hours || 0;
                        totals.specialPioneers.cursos += pub.courses || 0;
                    }
                    break;
                case 'missionary':
                    totals.missionaries.total++;
                    if (pub.participation === 'active') {
                        totals.missionaries.informes++;
                        totals.missionaries.horas += pub.hours || 0;
                        totals.missionaries.cursos += pub.courses || 0;
                    }
                    break;
            }

            // Contar siervos especiales
            if (pub.specialServants) {
                switch (pub.specialServants) {
                    case 'circuitOverseer':
                        totals.specialServants.circuitOverseer++;
                        break;
                    case 'bethelite':
                        totals.specialServants.bethelite++;
                        break;
                    case 'construction':
                        totals.specialServants.construction++;
                        break;
                    case 'instructor':
                        totals.specialServants.instructor++;
                        break;
                    case 'volunteerA2':
                        totals.specialServants.volunteerA2++;
                        break;
                    case 'volunteerA19':
                        totals.specialServants.volunteerA19++;
                        break;
                    case 'volunteerA2ToA19':
                        //totals.specialServants.volunteerA2ToA19++;
                        totals.specialServants.volunteerA2++;
                        totals.specialServants.volunteerA19++;
                        break;
                }
            }

            // Contar privilegios
            if (pub.privilege === 'elder') {
                totals.privileges.elders++;
            } else if (pub.privilege === 'ministerialServant') {
                totals.privileges.ministerialServants++;
            }

            // Contar esperanza y estado
            if (pub.hope === 'otherSheep') {
                totals.otherStats.otherSheep++;
            } else if (pub.hope === 'anointed') {
                totals.otherStats.anointed++;
            }

            if (pub.participation === 'active') {
                totals.otherStats.activePublishers++;
            } else if (pub.participation === 'inactive') {
                totals.otherStats.inactivePublishers++;
            }

            totals.otherStats.totalCongregation++;
        });
    });

    // Calcular promedios
    if (totals.unbaptizedPublishers.informes > 0) {
        totals.unbaptizedPublishers.promedioCursos = totals.unbaptizedPublishers.cursos / totals.unbaptizedPublishers.informes;
    }
    if (totals.publishers.informes > 0) {
        totals.publishers.promedioCursos = totals.publishers.cursos / totals.publishers.informes;
    }
    if (totals.auxiliarPioneers.informes > 0) {
        totals.auxiliarPioneers.promedioHoras = totals.auxiliarPioneers.horas / totals.auxiliarPioneers.informes;
        totals.auxiliarPioneers.promedioCursos = totals.auxiliarPioneers.cursos / totals.auxiliarPioneers.informes;
    }
    if (totals.regularPioneers.informes > 0) {
        totals.regularPioneers.promedioHoras = totals.regularPioneers.horas / totals.regularPioneers.informes;
        totals.regularPioneers.promedioCursos = totals.regularPioneers.cursos / totals.regularPioneers.informes;
    }
    if (totals.specialPioneers.informes > 0) {
        totals.specialPioneers.promedioHoras = totals.specialPioneers.horas / totals.specialPioneers.informes;
        totals.specialPioneers.promedioCursos = totals.specialPioneers.cursos / totals.specialPioneers.informes;
    }
    if (totals.missionaries.informes > 0) {
        totals.missionaries.promedioHoras = totals.missionaries.horas / totals.missionaries.informes;
        totals.missionaries.promedioCursos = totals.missionaries.cursos / totals.missionaries.informes;
    }

    return totals;
};

export const calculateGroupTotals = (group: GroupData): Totals => {
    return calculateTotals([group]);
};

export const formatNumber = (num: number, decimals: number = 1): string => {
    return num.toFixed(decimals);
};

export const formatPercentage = (num: number, total: number): string => {
    if (total === 0) return '0%';
    return `${((num / total) * 100).toFixed(1)}%`;
};