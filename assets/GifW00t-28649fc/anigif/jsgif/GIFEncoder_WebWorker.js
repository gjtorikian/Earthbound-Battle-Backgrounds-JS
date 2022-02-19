GIFEncoder_WebWorker = function(options) {
    
    var exports = {}
    
    var init = exports.init = function init() {
        this.repeat = 0
        this.delay = 250
        this.frames = []
        this.num_threads = 8
        this.base_url = options.base_url
    }
    
    var setRepeat = exports.setRepeat = function setRepeat(repeat) {
        this.repeat = repeat
    }
    
    var setDelay = exports.setDelay = function setDelay(delay) {
        this.delay = delay
    }
    
    var setThreads = exports.setThreads = function setThreads(num_threads) {
        this.num_threads = num_threads
    }
    
    var addFrame = exports.addFrame = function addFrame(im/*BitmapData*/, is_imageData)/*Boolean*/ {
        this.frames.push(im)
        return true;
    }

    var start = exports.start = function start() {
         return true;       
    }
    
    var finish_sync = exports.finish_sync = function finish_sync(cba) {
        var encoder = new window.GIFEncoder();
        encoder.setRepeat(this.repeat); //auto-loop
        encoder.setDelay(this.delay);
        encoder.start();
         for (var i=0; i<this.frames.length; i++) {
            encoder.addFrame(this.frames[i]);
        }
        encoder.finish();
        cba(null, encoder.stream().getData())
    }
    
    var finish_async_internal = exports.finish_async_internal = function finish_async_internal(url, singleCompleteEvent, cba) {
        var animation_parts = new Array(this.frames.length);
        
        console.log("threads: " + this.num_threads)
        var crew = new WorkCrew(url, this.num_threads);
        crew.oncomplete = function(result) {
            if (singleCompleteEvent) singleCompleteEvent()
            //console.log("done: " + result.id)
            animation_parts[result.id] = result.result.data;
        };
        
        crew.onfinish = function() {
            crew.clean();
            var res = animation_parts.join('')
            cba(null, res)
        };
      
        
        for (var j=0; j<this.frames.length; j++) {
            
            var curr = this.frames[j]
            var imdata = curr.getImageData(0,0,curr.canvas.width, curr.canvas.height)
            var len = curr.canvas.width * curr.canvas.height * 4;
            
            var msg = {
                frame_index: j,
                frame_length:  this.frames.length,
                height:  curr.canvas.height, 
                width: curr.canvas.width,
                repeat: this.repeat,
                delay:  this.delay,
                imageData: imdata.data.buffer//imarray.join(',')
            }
            window.x = curr
            window.y = imdata
            crew.addWork(msg);
            //console.log("addWork");
        }
    }
    
    function downloadString(url, cba) {
            var xmlHttp = new XMLHttpRequest(); 
            xmlHttp.onreadystatechange = function() {
                
                if (xmlHttp.readyState == 4) {
                    cba(xmlHttp.status == 200?null:xmlHttp.status, xmlHttp.responseText)   
                }
            }
            xmlHttp.open( "GET", url, true );
            xmlHttp.send( null );    
    }
        
    var finish_async = exports.finish_async = function finish_async(opt) {
        var self = this
        var url = self.base_url + 'worker.js';
        downloadString(self.base_url + 'worker.js', function(err, content) {
            var content_working = "var base_url_injected='" + self.base_url + "';\r\n" + content;
            var blob = new Blob([content_working], {type: "text/javascript"})
            
            var url = null;
            if (window.webkitURL) url = window.webkitURL.createObjectURL(blob)
            else url = window.URL.createObjectURL(blob)
            
            
            self.finish_async_internal(url, opt.singleComplete, function(err, res) {
                opt.done(null, res);
            })
            
        })
    }

    
    exports.init()
    return exports;
}


