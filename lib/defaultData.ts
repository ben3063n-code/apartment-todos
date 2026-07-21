import type { Language } from './models';

export const ONBOARDING_FOLDER_EMOJI = '🚀';

type FocusDemoTask = { folderIndex: number; title: string; minutes: number; priority: 1 | 2 | 3 | 4 | 5 };
type Subfolder = { name: string; todo: string };

type DefaultDataSet = {
  folderNames: string[];
  onboardingFolderName: string;
  onboardingTodos: string[];
  focusDemoTasks: FocusDemoTask[];
  kitchenSubfolders: Subfolder[];
};

const DATA: Record<Exclude<Language, 'auto'>, DefaultDataSet> = {
  de: {
    folderNames: ['Küche', 'Wohnzimmer', 'Universität', 'Badezimmer', 'Beruf', 'Privat', 'Ideen', 'Bücherliste'],
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
      { folderIndex: 0, title: 'Küche putzen', minutes: 30, priority: 2 },
      { folderIndex: 1, title: 'Wohnzimmer aufräumen', minutes: 20, priority: 4 },
      { folderIndex: 3, title: 'Bad putzen', minutes: 25, priority: 3 },
    ],
    kitchenSubfolders: [
      { name: 'Putzen', todo: 'Boden wischen' },
      { name: 'Einkaufen', todo: 'Einkaufsliste schreiben' },
      { name: 'Rezepte', todo: 'Lieblingsrezept speichern' },
    ],
  },
  en: {
    folderNames: ['Kitchen', 'Living Room', 'University', 'Bathroom', 'Work', 'Private', 'Ideas', 'Book List'],
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
      { folderIndex: 0, title: 'Clean the kitchen', minutes: 30, priority: 2 },
      { folderIndex: 1, title: 'Tidy the living room', minutes: 20, priority: 4 },
      { folderIndex: 3, title: 'Clean the bathroom', minutes: 25, priority: 3 },
    ],
    kitchenSubfolders: [
      { name: 'Cleaning', todo: 'Mop the floor' },
      { name: 'Shopping', todo: 'Write the shopping list' },
      { name: 'Recipes', todo: 'Save a favorite recipe' },
    ],
  },
  fr: {
    folderNames: ['Cuisine', 'Salon', 'Université', 'Salle de bain', 'Travail', 'Privé', 'Idées', 'Liste de livres'],
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
      { folderIndex: 0, title: 'Nettoyer la cuisine', minutes: 30, priority: 2 },
      { folderIndex: 1, title: 'Ranger le salon', minutes: 20, priority: 4 },
      { folderIndex: 3, title: 'Nettoyer la salle de bain', minutes: 25, priority: 3 },
    ],
    kitchenSubfolders: [
      { name: 'Ménage', todo: 'Laver le sol' },
      { name: 'Courses', todo: 'Écrire la liste de courses' },
      { name: 'Recettes', todo: 'Enregistrer une recette préférée' },
    ],
  },
  it: {
    folderNames: ['Cucina', 'Soggiorno', 'Università', 'Bagno', 'Lavoro', 'Privato', 'Idee', 'Lista libri'],
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
      { folderIndex: 0, title: 'Pulire la cucina', minutes: 30, priority: 2 },
      { folderIndex: 1, title: 'Riordinare il soggiorno', minutes: 20, priority: 4 },
      { folderIndex: 3, title: 'Pulire il bagno', minutes: 25, priority: 3 },
    ],
    kitchenSubfolders: [
      { name: 'Pulizie', todo: 'Lavare il pavimento' },
      { name: 'Spesa', todo: 'Scrivere la lista della spesa' },
      { name: 'Ricette', todo: 'Salvare una ricetta preferita' },
    ],
  },
  zh: {
    folderNames: ['厨房', '客厅', '大学', '浴室', '工作', '私人', '点子', '书单'],
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
      { folderIndex: 0, title: '打扫厨房', minutes: 30, priority: 2 },
      { folderIndex: 1, title: '整理客厅', minutes: 20, priority: 4 },
      { folderIndex: 3, title: '打扫浴室', minutes: 25, priority: 3 },
    ],
    kitchenSubfolders: [
      { name: '打扫', todo: '拖地' },
      { name: '购物', todo: '写购物清单' },
      { name: '食谱', todo: '保存一个喜欢的食谱' },
    ],
  },
  ja: {
    folderNames: ['キッチン', 'リビング', '大学', 'バスルーム', '仕事', 'プライベート', 'アイデア', 'ブックリスト'],
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
      { folderIndex: 0, title: 'キッチンを掃除する', minutes: 30, priority: 2 },
      { folderIndex: 1, title: 'リビングを片付ける', minutes: 20, priority: 4 },
      { folderIndex: 3, title: 'バスルームを掃除する', minutes: 25, priority: 3 },
    ],
    kitchenSubfolders: [
      { name: '掃除', todo: '床を拭く' },
      { name: '買い物', todo: '買い物リストを書く' },
      { name: 'レシピ', todo: 'お気に入りのレシピを保存する' },
    ],
  },
};

export function getDefaultData(language: Exclude<Language, 'auto'>): DefaultDataSet {
  return DATA[language];
}
