/**

==========================================================

Rubik Solver Pro

animation.js

Part 1 - Animation Foundation & State Infrastructure

Three.js r179+ & ES Modules

==========================================================
*/


import * as THREE from "three";

// =========================================================
// அனிமேஷன் வகை மாறிலிகள் (Animation Configuration Constants)
// =========================================================
export const ANIMATION_TYPES = {
NONE: "NONE",
FACE_ROTATION: "FACE_ROTATION",
SOLVE_MOVE: "SOLVE_MOVE",
SEQUENCE: "SEQUENCE"
};

export default class CubeAnimation {

constructor(engine) {  
    if (!engine) {  
        throw new Error("CubeAnimation: CubeEngine இன்ஸ்டன்ஸ் கட்டாயமாக தேவை.");  
    }  
      
    // முதன்மை கியூப் என்ஜினின் குறிப்பு (Public reference to CubeEngine)  
    this.engine = engine;  

    // --------------------------------------------------  
    // அனிமேஷன் நிலைகள் (Animation State Infrastructure)  
    // --------------------------------------------------  
    this.currentType = ANIMATION_TYPES.NONE;  
    this.isActive = false;  
      
    // மிதவைப்புள்ளி துல்லியத்திற்கான மாறிகள் (Floating-point safe progress tracking)  
    this.progress = 0.0;  
    this.duration = 0; // மில்லி விநாடிகளில் (in milliseconds)  
    this.startTime = 0;  

    // --------------------------------------------------  
    // அனிமேஷன் வரிசை அடித்தளம் (Queue Foundation)  
    // --------------------------------------------------  
    this.animationQueue = [];  
      
    // அனிமேஷன் முடிவடையும் போது இயங்கும் கால்பேக்  
    this.onCompleteCallback = null;  
}  

// =========================================================  
// உற்பத்திக்கான ஈசிங் செயல்பாடுகள் (Production Easing Functions)  
// =========================================================  

/**  
 * நேரியல் அசைவு (Linear Easing)  
 */  
easeLinear(t) {  
    return t;  
}  

/**  
 * மெதுவான தொடக்கம் (Ease-In Quad)  
 */  
easeInQuad(t) {  
    return t * t;  
}  

/**  
 * மெதுவான முடிவு (Ease-Out Quad)  
 */  
easeOutQuad(t) {  
    return t * (2 - t);  
}  

/**  
 * மெதுவான தொடக்கம் மற்றும் முடிவு (Ease-In-Out Quad)  
 */  
easeInOutQuad(t) {  
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;  
}  

/**  
 * அதிவேக மெதுவான முடிவு (Ease-Out Cubic)  
 * தானியங்கி பக்க சுழற்சிகளுக்கு (Face Navigation) மிகவும் உகந்தது.  
 */  
easeOutCubic(t) {  
    const tMinusOne = t - 1;  
    return tMinusOne * tMinusOne * tMinusOne + 1;  
}  

/**  
 * சமநிலையான மெதுவான தொடக்கம் மற்றும் முடிவு (Ease-In-Out Cubic)  
 * கியூப் லேயர் சுழற்சிகளுக்கு (Solve Moves) மிகவும் ஏற்றது.  
 */  
easeInOutCubic(t) {  
    return t < 0.5   
        ? 4 * t * t * t   
        : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;  
}

}

// =====================================================  
// Part 2  
// Queue Execution & State Management System  
// =====================================================  

/**  
 * அனிமேஷன் வரிசையில் புதிய அனிமேஷனை சேர்க்கிறது  
 */  
enqueueAnimation(type, data, duration = 450, callback = null) {  
    this.animationQueue.push({  
        type: type,  
        data: data,  
        duration: duration,  
        callback: callback  
    });  
      
    this.processQueue();  
}  

/**  
 * அனிமேஷன் வரிசையைச் சீராகச் செயலாக்குகிறது (Queue Processing)  
 */  
processQueue() {  
    // ஏற்கனவே அனிமேஷன் இயங்கிக்கொண்டிருந்தாலோ அல்லது கியூப் என்ஜின் செயல்பாட்டில் இருந்தாலோ தவிர்க்கவும்  
    if (this.isActive || this.engine.isAnimating || this.animationQueue.length === 0) {  
        return;  
    }  

    const nextAnimation = this.animationQueue.shift();  
      
    this.start(  
        nextAnimation.type,  
        nextAnimation.data,  
        nextAnimation.duration,  
        nextAnimation.callback  
    );  
}  

/**  
 * ஒரு குறிப்பிட்ட அனிமேஷனைத் தொடங்குகிறது (Animation Start)  
 */  
start(type, data, duration, callback) {  
    if (this.isActive) {  
        this.stop();  
    }  

    this.isActive = true;  
    this.currentType = type;  
    this.progress = 0.0;  
    this.duration = duration;  
    this.onCompleteCallback = callback;  
    this.startTime = performance.now();  

    if (type === ANIMATION_TYPES.FACE_ROTATION) {  
        // கியூப் என்ஜினின் பொது தானியங்கி பக்க சுழற்சியைத் தூண்டுகிறது  
        if (typeof this.engine.navigateToFace === "function") {  
            this.engine.navigateToFace(data.faceCode);  
        } else {  
            this.stop();  
        }  
    } else if (type === ANIMATION_TYPES.SOLVE_MOVE) {  
        // நகர்வு அனிமேஷன்களுக்கான அடிப்படை அடித்தளம் (Engine Queue Hook)  
        if (typeof this.engine.enqueue === "function") {  
            this.engine.enqueue(data.move);  
        } else {  
            this.stop();  
        }  
    }  
}  

/**  
 * இயங்கும் அனிமேஷனைப் பாதுகாப்பாக நிறுத்துகிறது (Safe Cancellation)  
 */  
stop() {  
    this.isActive = false;  
    this.currentType = ANIMATION_TYPES.NONE;  
    this.progress = 0.0;  
      
    // நினைவக கசிவைத் தவிர்க்க கால்பேக் குறிப்பை பாதுகாப்பாக எடுத்து மாற்றுகிறது  
    const activeCallback = this.onCompleteCallback;  
    this.onCompleteCallback = null;  
      
    return activeCallback;  
}  

/**  
 * முதன்மை கிளாக்கின் டெல்டா நேரத்தைக் கொண்டு நிலையைப் புதுப்பிக்கிறது (Update Loop)  
 */  
update(delta) {  
    if (!this.isActive) {  
        // அனிமேஷன் ஏதும் இயங்காதபோது வரிசையில் நகர்வுகள் இருந்தால் செயலாக்க தூண்டுகிறது  
        if (this.animationQueue.length > 0 && !this.engine.isAnimating) {  
            this.processQueue();  
        }  
        return;  
    }  

    // கியூப் என்ஜினின் தற்போதைய அனிமேஷன் நிலையை உன்னிப்பாகக் கண்காணிக்கிறது  
    if (this.currentType === ANIMATION_TYPES.FACE_ROTATION || this.currentType === ANIMATION_TYPES.SOLVE_MOVE) {  
        if (!this.engine.isAnimating && !this.engine.currentMove) {  
            // கியூப் என்ஜின் தனது சுழற்சியை முழுமையாக முடித்துவிட்டது  
            this.progress = 1.0;  
            this.handleAnimationCompletion();  
        } else {  
            // மிதவைப்புள்ளி பிழையின்றி என்ஜின் முன்னேற்றத்தைப் பகிர்ந்து கொள்கிறது  
            this.progress = this.engine.moveProgress !== undefined ? this.engine.moveProgress : 0.5;  
        }  
    }  
}  

/**  
 * அனிமேஷன் வெற்றிகரமாக முடிந்தபின் கால்பேக்குகளை இயக்கி வரிசையைத் தொடர்கிறது  
 */  
handleAnimationCompletion() {  
    const callbackToExecute = this.stop();  
      
    if (typeof callbackToExecute === "function") {  
        try {  
            callbackToExecute();  
        } catch (error) {  
            console.error("CubeAnimation: கால்பேக் இயக்குவதில் பிழை ஏற்ப்பட்டுள்ளது ->", error);  
        }  
    }  

    // வரிசையில் உள்ள அடுத்த அனிமேஷனுக்கு தடையின்றிச் செல்கிறது  
    this.processQueue();  
}  

/**  
 * அனிமேஷன் வரிசையை முழுமையாக சுத்தம் செய்கிறது  
 */  
clearQueue() {  
    this.animationQueue = [];  
    this.stop();  
}

// =====================================================  
// Part 3  
// Solver Move Playback & Algorithm Player Engine  
// =====================================================  

/**  
 * ஒரு முழுமையான தீர்வு அல்காரிதத்தை வரிசையாக இயக்கத் தொடங்குகிறது (Play)  
 */  
play(algorithmStr, speedMode = "fast", onMoveComplete = null, onPlaybackComplete = null) {  
    if (!algorithmStr || typeof algorithmStr !== "string") return;  

    // ஏற்கனவே பிளேபேக் இயங்கிக்கொண்டிருந்தால் அதை பாதுகாப்பாக நிறுத்துகிறது  
    this.stopPlayback();  

    // அல்காரிதம் சரத்தை பிரித்து நகர்வுகளின் வரிசையாக மாற்றுகிறது  
    this.playbackQueue = algorithmStr.trim().split(/\s+/).filter(move => move.length > 0);  
    if (this.playbackQueue.length === 0) return;  

    // பிளேபேக் நிலைகளை அமைக்கிறது  
    this.isPlaybackActive = true;  
    this.isPlaybackPaused = false;  
      
    // கால்பேக்குகளைப் பதிவு செய்கிறது  
    this.onMoveCompleteCallback = onMoveComplete;  
    this.onPlaybackCompleteCallback = onPlaybackComplete;  

    // வேகக் கட்டுப்பாட்டை அமைத்து முதல் நகர்வை இயக்குகிறது  
    this.setPlaybackSpeed(speedMode);  
    this.playNextMove();  
}  

/**  
 * இயங்கும் பிளேபேக்கை பாதுகாப்பாக தற்காலிகமாக நிறுத்துகிறது (Pause)  
 */  
pause() {  
    if (!this.isPlaybackActive || this.isPlaybackPaused) return;  

    this.isPlaybackPaused = true;  
      
    // கியூப் என்ஜினின் தற்போதைய சுழற்சி அனிமேஷனை அப்படியே முடக்குகிறது  
    this.engine.isPaused = true;  
}  

/**  
 * தற்காலிகமாக நிறுத்தப்பட்ட பிளேபேக்கை மீண்டும் தொடங்குகிறது (Resume)  
 */  
resume() {  
    if (!this.isPlaybackActive || !this.isPlaybackPaused) return;  

    this.isPlaybackPaused = false;  
      
    // கியூப் என்ஜின் முடக்கத்தை நீக்கி அனிமேஷனைத் தொடரச் செய்கிறது  
    this.engine.isPaused = false;  
      
    // அனிமேஷன் வரிசை முடங்கியிருந்தால் அதை மீண்டும் தூண்டுகிறது  
    if (!this.isActive && !this.engine.isAnimating) {  
        this.playNextMove();  
    }  
}  

/**  
 * பிளேபேக் செயல்பாட்டை முழுமையாக நிறுத்தி நிலைகளைச் சுத்தம் செய்கிறது (Stop Playback)  
 */  
stopPlayback() {  
    this.isPlaybackActive = false;  
    this.isPlaybackPaused = false;  
    this.playbackQueue = [];  
      
    // என்ஜின் முடக்க நிலைகளை மீட்டமைக்கிறது  
    this.engine.isPaused = false;  

    // முதன்மை அனிமேஷன் வரிசையைச் சுத்தம் செய்கிறது  
    this.clearQueue();  

    // கால்பேக் குறிப்புகளை நினைவகத்திலிருந்து நீக்குகிறது  
    this.onMoveCompleteCallback = null;  
    this.onPlaybackCompleteCallback = null;  
}  

/**  
 * தற்போதைய நகர்வை உடனடியாக முடித்து அடுத்த நகர்வுக்குச் செல்கிறது (Skip Move)  
 */  
skipCurrentMove() {  
    if (!this.isPlaybackActive) return;  

    // என்ஜின் தற்காலிகமாக நிறுத்தப்பட்டிருந்தால் அதை தற்காலிகமாக விடுவிக்கிறது  
    const wasPaused = this.isPlaybackPaused;  
    this.engine.isPaused = false;  

    if (this.engine.isAnimating && typeof this.engine.endMove === "function") {  
        // கியூப் என்ஜினை தற்போதைய நகர்வை உடனடியாக ஸ்னாப் செய்து முடிக்கக் கோருகிறது  
        this.engine.endMove();  
          
        // அனிமேஷன் மேலாளரின் நிலையைப் புதுப்பித்து கால்பேக்கை இயக்குகிறது  
        this.update(0);  
    } else if (!this.isActive && this.playbackQueue.length > 0) {  
        // எந்த அனிமேஷனும் இயங்காமல் வரிசையில் நகர்வுகள் இருந்தால் அடுத்த நகர்வுக்குச் செல்கிறது  
        this.playNextMove();  
    }  

    // பயனர் இடைநிறுத்த நிலையில் இருந்தால் அதைத் தக்கவைக்கிறது  
    if (wasPaused) {  
        this.pause();  
    }  
}  

/**  
 * பிளேபேக் இயங்கும் வேகத்தைக் கட்டுப்படுத்துகிறது (Speed Control)  
 */  
setPlaybackSpeed(speedModeOrMs) {  
    if (typeof speedModeOrMs === "number") {  
        this.engine.turnSpeed = speedModeOrMs;  
    } else if (this.engine.speed && this.engine.speed[speedModeOrMs] !== undefined) {  
        // என்ஜினில் ஏற்கனவே உள்ள வேக அமைப்புகளைப் பயன்படுத்துகிறது (normal, fast, faster)  
        this.engine.turnSpeed = this.engine.speed[speedModeOrMs];  
    }  
}  

/**  
 * பிளேபேக் வரிசையில் உள்ள அடுத்த நகர்வை பாதுகாப்பாகச் செயலாக்குகிறது  
 */  
playNextMove() {  
    if (!this.isPlaybackActive || this.isPlaybackPaused) return;  

    if (this.playbackQueue.length === 0) {  
        this.handlePlaybackCompletion();  
        return;  
    }  

    const nextMove = this.playbackQueue.shift();  

    // பகுதி 2-ன் வரிசை அமைப்பில் நகர்வை இணைக்கிறது  
    this.enqueueAnimation(  
        ANIMATION_TYPES.SOLVE_MOVE,  
        { move: nextMove },  
        this.engine.turnSpeed,  
        () => {  
            // நகர்வு வெற்றிகரமாக முடிந்ததும் கால்பேக்கை இயக்குகிறது  
            if (typeof this.onMoveCompleteCallback === "function") {  
                try {  
                    this.onMoveCompleteCallback(nextMove);  
                } catch (e) {  
                    console.error("CubeAnimation: Playback move callback error ->", e);  
                }  
            }  
            // அடுத்த நகர்வைத் தொடர்கிறது  
            this.playNextMove();  
        }  
    );  
}  

/**  
 * அனைத்து நகர்வுகளும் முடிந்தபின் பிளேபேக் நிறைவைக் கையாள்கிறது  
 */  
handlePlaybackCompletion() {  
    const completionCallback = this.onPlaybackCompleteCallback;  
      
    // நிலைகளைச் சுத்தம் செய்கிறது  
    this.stopPlayback();  

    // நிறைவு கால்பேக்கை ஒரே ஒரு முறை மட்டும் பாதுகாப்பாக இயக்குகிறது  
    if (typeof completionCallback === "function") {  
        try {  
            completionCallback();  
        } catch (e) {  
            console.error("CubeAnimation: Playback completion callback error ->", e);  
        }  
    }  
}
