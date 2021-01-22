var canvas;
var ctx;
var then;
var showDevText = false;
var showDebug = false;

var _keys = {};
var _leftMouseDown = false;
var _mousePoint = { x: 0, y: 0 };
var _mouseOutSide = false;
var _canvasCenter;
var _screenRect;
var _previousKey = 0;

var map;
var mapWidth = 3000;
var mapHeight = 2000;
var mapView;
var leftScreenMoveRect;
var topScreenMoveRect;
var rightScreenMoveRect;
var bottomScreenMoveRect;
var screenMoveTick = 3;
var screenMoveElapsed = 0;
var screenMoveStates = { left: 0, top: 0, right: 0, bottom: 0 };
var showMap = false;

var collisionEntityIndex = -1;
var collisionEntities = [];
var baseCollisionForce = 1.1;

var grass1Image = new Image();
var grass1Ready = false;

var maxResources;
var resourceSize = 50;
var minRandomResourceCount = 15;
var maxRandomResourceCount = 25;
var resourceImageDataList = [];
var resourceImage = new Image();
var resourceReady = false;

var horizontalScreenMoveImage = new Image();
var horizontalScreenMoveReady = false;

var verticalScreenMoveImage = new Image();
var verticalScreenMoveReady = false;

var cpuStartingHP = 1000;
var cpuStartSize = 100;
var cpuImage = new Image();
var cpuReady = false;

var botCost = 150;
var startingBotSize = 35;
var startingBotSpeed = 150;
var bot1Image = new Image();
var bot1Ready = false;

var bot2Image = new Image();
var bot2Ready = false;

var rogueBotStartSize = 65;
var rogue1Image = new Image();
var rogue1Ready = false;

var cpuList = [];
var resources = [];
var rogueBots = [];

var selectedGameObject = null;
var actionMenu = null;

var backgroundTileWidth = 1024;
var backgroundTileHeight = 1024;