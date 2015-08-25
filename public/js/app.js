/**
 *  @author Eugene Terentev <eugene@terentev.net>
 */
function Whiteboard(id) {
    var keyupTimer;
    this.room = window.location.hash.split("#")[1] || this.openRoom();

    this.editor = document.getElementById(id);
    this.editor.addEventListener('keyup', handleKeyup.bind(this));
    this.editor.addEventListener('change', this.sync.bind(this));

    this.websocket =  io({
        transports: ['websocket']
    });
    this.websocket.emit('join', this.room);
    this.websocket.on('welcome', handleWelcome.bind(this));
    this.websocket.on('diff', handleDiff.bind(this));

    this.diff = new diff_match_patch;


    function handleWelcome(base) {
        this.editor.value = this.base = base;
    }

    function handleKeyup() {
        clearTimeout(keyupTimer);
        keyupTimer = setTimeout(this.sync.bind(this), 1000)
    }

    function handleDiff(patches) {
        var results = this.diff.patch_apply(this.diff.patch_fromText(patches), this.base);
        var text = results[0];
        this.editor.value = this.base = text;
    }

}

Whiteboard.prototype.sync = function() {
    var base = this.base;
    var text = this.base = this.editor.value;
    var patches = this.diff.patch_make(base, text);
    this.websocket.emit('diff', this.room, this.diff.patch_toText(patches));
};

Whiteboard.prototype.openRoom = function() {
    var ts = (new Date).getTime();
    var rand = Math.floor(Math.random() * Math.pow(10, 4));
    var room = [ts, rand].join('-');
    window.location.hash = room;
    return room;
};

