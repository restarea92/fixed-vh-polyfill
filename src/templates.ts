export const debugContainerHTML = `
    <div id="log-container" class="hide">
        <h4 style="margin-top:1rem; margin-bottom: 0.5rem; border-bottom: 1px solid #555; padding-bottom: 0.25rem;">State</h4>
        <div id="status" style="display: flex; flex-direction: column; font-size: 0.6rem; margin-top: 0.5rem; gap: 0.2rem; background: rgba(255, 255, 255, 0.25); padding: 0.5rem; border-radius: 5px;">
            <span>isModuleNeeded: {{isModuleNeeded}}</span>
            <span>isDetectionComplete: {{isDetectionComplete}}</span>
            <span>isTouching: {{isTouching}}</span>
            <span>isTouchScrolling: {{isTouchScrolling}}</span>
            <span>isScrolling: {{isScrolling}}</span>
            <span>fvh: {{fvh}}</span>
            <span>lvh: {{lvh}}</span>
            <span>svh: {{svh}}</span>
        </div>
        <h4 style="margin-top:1rem; margin-bottom: 0.5rem; border-bottom: 1px solid #555; padding-bottom: 0.25rem;">Log</h4>
        <ul id="log-list" style="flex-grow: 1; overflow-y: auto; padding-right: 0.5rem; display:flex; flex-direction:column;"></ul>
        <button id="local-storage-clear-btn">Clear localStorage</button>
        <button id="close-log-btn">Close</button>
        <button id="open-log-btn">Debug Log</button>
    </div>
    <style>
        #log-container {
            position: fixed; bottom: 1rem; right: 1rem; background: rgba(0,0,0,0.8); color: white; padding: 1rem; border-radius: 10px; font-size: 0.5rem; z-index: 1000; width: 50%; height: calc(75 * var(--svh, 1vh)); overflow-x: clip; overflow-y: auto; font-family: monospace; display: flex; flex-direction: column; word-break: keep-all;
        }
        #log-container button { background: #555; color: white; cursor: pointer;  font-size: 0.5rem; }
        #log-container button#close-log-btn { position:absolute; top: 0.5rem; right: 0.5rem; padding: 0.25rem 0.5rem; font-size: 0.5rem; border: none; border-radius: 5px; background: #555; color: white; cursor: pointer;}
        #log-container button#open-log-btn { background: transparent; display:none; position:absolute; top:0; left:0; width:100%; height:100%; align-items: center; justify-content: center;}
        #log-container button#local-storage-clear-btn { padding: 0.25rem 0.5rem;border: none; border-radius: 5px; }
        #log-container.hide {
            overflow-y: hidden;
            width: 20ch; height: 2rem; padding: 0; border-radius: 0.5rem;
        }
        #log-container.hide > * { opacity: 0; padding: 0; margin: 0; height: 0; width:0; overflow: hidden; overflow-y: hidden; }
        #log-container.hide > button#open-log-btn { display: flex; opacity: 1;  position: absolute; top: 0; right: 0; width: 100%; height: 100%; border-radius: 50%; word-break: keep-all; }
    </style>
`;

export const statusHTMLTemplate = `
    <span>isModuleNeeded: {{isModuleNeeded}}</span>
    <span>isDetectionComplete: {{isDetectionComplete}}</span>
    <span>isTouching: {{isTouching}}</span>
    <span>isTouchScrolling: {{isTouchScrolling}}</span>
    <span>isScrolling: {{isScrolling}}</span>
    <span>fvh: {{fvh}}</span>
    <span>lvh: {{lvh}}</span>
    <span>svh: {{svh}}</span>
`;
