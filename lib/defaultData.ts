import type { Language } from './models';

export const ONBOARDING_FOLDER_EMOJI = '🚀';

type FocusDemoTask = { title: string; minutes: number; priority: 1 | 2 | 3 | 4 | 5 };
type Subfolder = { name: string; todo: string };

type DefaultDataSet = {
  householdFolderName: string;
  listFolderName: string;
  onboardingFolderName: string;
  onboardingTodos: string[];
  focusDemoTasks: FocusDemoTask[];
  householdSubfolders: Subfolder[];
};

const DATA: Record<Exclude<Language, 'auto'>, DefaultDataSet> = {
  de: {
    householdFolderName: 'Haushalt',
    listFolderName: 'Ideen',
    onboardingFolderName: 'Erste Schritte',
    onboardingTodos: [
      'Tippe auf einen Ordner links, um seine Aufgaben zu sehen',
      'Tippe auf "Alle ToDos" für eine Gesamtübersicht aller Aufgaben',
      'Ziehe in "Alle ToDos" eine Aufgabe auf einen Ordner, um sie zu verschieben',
      'Markiere Aufgaben mit ★ für deine "Fokus"-Arbeitsliste',
      'Jede Aufgabe kann Priorität, Fälligkeitsdatum, Wiederholung und Erinnerung haben',
      'Diesen Ordner kannst du jederzeit löschen',
    ],
    focusDemoTasks: [
      { title: 'Küche putzen', minutes: 30, priority: 2 },
      { title: 'Wohnzimmer aufräumen', minutes: 20, priority: 4 },
      { title: 'Bad putzen', minutes: 25, priority: 3 },
    ],
    householdSubfolders: [
      { name: 'Putzen', todo: 'Boden wischen' },
      { name: 'Rezepte', todo: 'Lieblingsrezept speichern' },
    ],
  },
  en: {
    householdFolderName: 'Household',
    listFolderName: 'Ideas',
    onboardingFolderName: 'Getting Started',
    onboardingTodos: [
      'Tap a folder on the left to see its tasks',
      'Tap "All ToDos" for an overview of every task',
      'In "All ToDos", drag a task onto a folder to move it',
      'Star tasks to add them to your "Focus" working list',
      'Every task can have a priority, due date, repeat, and reminder',
      'You can delete this folder anytime',
    ],
    focusDemoTasks: [
      { title: 'Clean the kitchen', minutes: 30, priority: 2 },
      { title: 'Tidy the living room', minutes: 20, priority: 4 },
      { title: 'Clean the bathroom', minutes: 25, priority: 3 },
    ],
    householdSubfolders: [
      { name: 'Cleaning', todo: 'Mop the floor' },
      { name: 'Recipes', todo: 'Save a favorite recipe' },
    ],
  },
  fr: {
    householdFolderName: 'Maison',
    listFolderName: 'Idées',
    onboardingFolderName: 'Premiers pas',
    onboardingTodos: [
      'Touche un dossier à gauche pour voir ses tâches',
      'Touche "Tous les ToDos" pour une vue d\'ensemble de toutes les tâches',
      'Dans "Tous les ToDos", fais glisser une tâche sur un dossier pour la déplacer',
      'Marque des tâches d\'une étoile pour les ajouter à ta liste "Focus"',
      'Chaque tâche peut avoir une priorité, une échéance, une répétition et un rappel',
      'Tu peux supprimer ce dossier à tout moment',
    ],
    focusDemoTasks: [
      { title: 'Nettoyer la cuisine', minutes: 30, priority: 2 },
      { title: 'Ranger le salon', minutes: 20, priority: 4 },
      { title: 'Nettoyer la salle de bain', minutes: 25, priority: 3 },
    ],
    householdSubfolders: [
      { name: 'Ménage', todo: 'Laver le sol' },
      { name: 'Recettes', todo: 'Enregistrer une recette préférée' },
    ],
  },
  it: {
    householdFolderName: 'Casa',
    listFolderName: 'Idee',
    onboardingFolderName: 'Per iniziare',
    onboardingTodos: [
      'Tocca una cartella a sinistra per vedere le sue attività',
      'Tocca "Tutti i ToDo" per una panoramica di tutte le attività',
      'In "Tutti i ToDo", trascina un\'attività su una cartella per spostarla',
      'Metti una stella alle attività per aggiungerle alla tua lista "Focus"',
      'Ogni attività può avere priorità, scadenza, ripetizione e promemoria',
      'Puoi eliminare questa cartella in qualsiasi momento',
    ],
    focusDemoTasks: [
      { title: 'Pulire la cucina', minutes: 30, priority: 2 },
      { title: 'Riordinare il soggiorno', minutes: 20, priority: 4 },
      { title: 'Pulire il bagno', minutes: 25, priority: 3 },
    ],
    householdSubfolders: [
      { name: 'Pulizie', todo: 'Lavare il pavimento' },
      { name: 'Ricette', todo: 'Salvare una ricetta preferita' },
    ],
  },
  zh: {
    householdFolderName: '家务',
    listFolderName: '点子',
    onboardingFolderName: '快速上手',
    onboardingTodos: [
      '点击左侧的文件夹查看其中的任务',
      '点击"所有待办"查看所有任务的总览',
      '在"所有待办"中，将任务拖到文件夹上即可移动',
      '给任务加星标即可加入你的"专注"工作列表',
      '每个任务都可以设置优先级、截止日期、重复和提醒',
      '你可以随时删除这个文件夹',
    ],
    focusDemoTasks: [
      { title: '打扫厨房', minutes: 30, priority: 2 },
      { title: '整理客厅', minutes: 20, priority: 4 },
      { title: '打扫浴室', minutes: 25, priority: 3 },
    ],
    householdSubfolders: [
      { name: '打扫', todo: '拖地' },
      { name: '食谱', todo: '保存一个喜欢的食谱' },
    ],
  },
  ja: {
    householdFolderName: '家事',
    listFolderName: 'アイデア',
    onboardingFolderName: 'はじめに',
    onboardingTodos: [
      '左のフォルダをタップすると、そのタスクが表示されます',
      '"すべてのToDo"をタップすると全タスクの概要が見られます',
      '"すべてのToDo"でタスクをフォルダにドラッグすると移動できます',
      'タスクに星を付けると"フォーカス"の作業リストに追加されます',
      '各タスクには優先度・期限・繰り返し・リマインダーを設定できます',
      'このフォルダはいつでも削除できます',
    ],
    focusDemoTasks: [
      { title: 'キッチンを掃除する', minutes: 30, priority: 2 },
      { title: 'リビングを片付ける', minutes: 20, priority: 4 },
      { title: 'バスルームを掃除する', minutes: 25, priority: 3 },
    ],
    householdSubfolders: [
      { name: '掃除', todo: '床を拭く' },
      { name: 'レシピ', todo: 'お気に入りのレシピを保存する' },
    ],
  },
};

export function getDefaultData(language: Exclude<Language, 'auto'>): DefaultDataSet {
  return DATA[language];
}
