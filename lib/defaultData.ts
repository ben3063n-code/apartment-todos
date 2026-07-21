import type { Language } from './models';

export const ONBOARDING_FOLDER_EMOJI = '🚀';

type RoomSubfolder = { name: string; task: string; minutes: number; priority: 1 | 2 | 3 | 4 | 5 };

type DefaultDataSet = {
  onboardingFolderName: string;
  onboardingTodos: string[];
  homeFolderName: string;
  roomSubfolders: RoomSubfolder[];
  listFolderName: string;
  privateFolderName: string;
  workFolderName: string;
};

const DATA: Record<Exclude<Language, 'auto'>, DefaultDataSet> = {
  de: {
    onboardingFolderName: 'Erste Schritte',
    onboardingTodos: [
      'Tippe auf einen Ordner links, um seine Aufgaben zu sehen',
      'Tippe auf "Alle ToDos" für eine Gesamtübersicht aller Aufgaben',
      'Ziehe in "Alle ToDos" eine Aufgabe auf einen Ordner, um sie zu verschieben',
      'Markiere Aufgaben mit ★ für deine "Fokus"-Arbeitsliste',
      'Jede Aufgabe kann Priorität, Fälligkeitsdatum, Wiederholung und Erinnerung haben',
      'Diesen Ordner kannst du jederzeit löschen',
    ],
    homeFolderName: 'Zuhause',
    roomSubfolders: [
      { name: 'Küche', task: 'Küche putzen', minutes: 30, priority: 2 },
      { name: 'Wohnzimmer', task: 'Wohnzimmer aufräumen', minutes: 20, priority: 4 },
      { name: 'Bad', task: 'Bad putzen', minutes: 25, priority: 3 },
    ],
    listFolderName: 'Ideen',
    privateFolderName: 'Privat',
    workFolderName: 'Arbeit',
  },
  en: {
    onboardingFolderName: 'Getting Started',
    onboardingTodos: [
      'Tap a folder on the left to see its tasks',
      'Tap "All ToDos" for an overview of every task',
      'In "All ToDos", drag a task onto a folder to move it',
      'Star tasks to add them to your "Focus" working list',
      'Every task can have a priority, due date, repeat, and reminder',
      'You can delete this folder anytime',
    ],
    homeFolderName: 'Home',
    roomSubfolders: [
      { name: 'Kitchen', task: 'Clean the kitchen', minutes: 30, priority: 2 },
      { name: 'Living Room', task: 'Tidy the living room', minutes: 20, priority: 4 },
      { name: 'Bathroom', task: 'Clean the bathroom', minutes: 25, priority: 3 },
    ],
    listFolderName: 'Ideas',
    privateFolderName: 'Private',
    workFolderName: 'Work',
  },
  fr: {
    onboardingFolderName: 'Premiers pas',
    onboardingTodos: [
      'Touche un dossier à gauche pour voir ses tâches',
      'Touche "Tous les ToDos" pour une vue d\'ensemble de toutes les tâches',
      'Dans "Tous les ToDos", fais glisser une tâche sur un dossier pour la déplacer',
      'Marque des tâches d\'une étoile pour les ajouter à ta liste "Focus"',
      'Chaque tâche peut avoir une priorité, une échéance, une répétition et un rappel',
      'Tu peux supprimer ce dossier à tout moment',
    ],
    homeFolderName: 'Maison',
    roomSubfolders: [
      { name: 'Cuisine', task: 'Nettoyer la cuisine', minutes: 30, priority: 2 },
      { name: 'Salon', task: 'Ranger le salon', minutes: 20, priority: 4 },
      { name: 'Salle de bain', task: 'Nettoyer la salle de bain', minutes: 25, priority: 3 },
    ],
    listFolderName: 'Idées',
    privateFolderName: 'Privé',
    workFolderName: 'Travail',
  },
  it: {
    onboardingFolderName: 'Per iniziare',
    onboardingTodos: [
      'Tocca una cartella a sinistra per vedere le sue attività',
      'Tocca "Tutti i ToDo" per una panoramica di tutte le attività',
      'In "Tutti i ToDo", trascina un\'attività su una cartella per spostarla',
      'Metti una stella alle attività per aggiungerle alla tua lista "Focus"',
      'Ogni attività può avere priorità, scadenza, ripetizione e promemoria',
      'Puoi eliminare questa cartella in qualsiasi momento',
    ],
    homeFolderName: 'Casa',
    roomSubfolders: [
      { name: 'Cucina', task: 'Pulire la cucina', minutes: 30, priority: 2 },
      { name: 'Soggiorno', task: 'Riordinare il soggiorno', minutes: 20, priority: 4 },
      { name: 'Bagno', task: 'Pulire il bagno', minutes: 25, priority: 3 },
    ],
    listFolderName: 'Idee',
    privateFolderName: 'Privato',
    workFolderName: 'Lavoro',
  },
  zh: {
    onboardingFolderName: '快速上手',
    onboardingTodos: [
      '点击左侧的文件夹查看其中的任务',
      '点击"所有待办"查看所有任务的总览',
      '在"所有待办"中，将任务拖到文件夹上即可移动',
      '给任务加星标即可加入你的"专注"工作列表',
      '每个任务都可以设置优先级、截止日期、重复和提醒',
      '你可以随时删除这个文件夹',
    ],
    homeFolderName: '家',
    roomSubfolders: [
      { name: '厨房', task: '打扫厨房', minutes: 30, priority: 2 },
      { name: '客厅', task: '整理客厅', minutes: 20, priority: 4 },
      { name: '浴室', task: '打扫浴室', minutes: 25, priority: 3 },
    ],
    listFolderName: '点子',
    privateFolderName: '私人',
    workFolderName: '工作',
  },
  ja: {
    onboardingFolderName: 'はじめに',
    onboardingTodos: [
      '左のフォルダをタップすると、そのタスクが表示されます',
      '"すべてのToDo"をタップすると全タスクの概要が見られます',
      '"すべてのToDo"でタスクをフォルダにドラッグすると移動できます',
      'タスクに星を付けると"フォーカス"の作業リストに追加されます',
      '各タスクには優先度・期限・繰り返し・リマインダーを設定できます',
      'このフォルダはいつでも削除できます',
    ],
    homeFolderName: '自宅',
    roomSubfolders: [
      { name: 'キッチン', task: 'キッチンを掃除する', minutes: 30, priority: 2 },
      { name: 'リビング', task: 'リビングを片付ける', minutes: 20, priority: 4 },
      { name: 'バスルーム', task: 'バスルームを掃除する', minutes: 25, priority: 3 },
    ],
    listFolderName: 'アイデア',
    privateFolderName: 'プライベート',
    workFolderName: '仕事',
  },
};

export function getDefaultData(language: Exclude<Language, 'auto'>): DefaultDataSet {
  return DATA[language];
}
