
function 读取xml(myXMLpath){
    try{
        xmlObj.load(myXMLpath); 
       }catch(e){ 
        xmlObj = new XMLHttpRequest(); 
        xmlObj.overrideMimeType("text/xml");
        xmlObj.open("GET", myXMLpath, false);
        xmlObj.send(null);
        xmlResult = xmlObj.responseXML; 
       
        return xmlResult;
        }
        return xmlObj.documentElement;
}

class DOM弹幕引擎 {

    constructor() {
        this.MY弹幕板 = document.getElementById("MY弹幕板");
        this.h=this.MY弹幕板.offsetHeight
        this.w=this.MY弹幕板.offsetWidth
        this.航道信息 = [];this.航道高度=20;this.航道数量;this.特殊航道信息 = [];//TODO 特殊弹幕存留时间
        this.弹幕信息 = [];this.弹幕指针=0;this.弹幕数量;this.屏上弹幕=[];this.特殊弹幕存留时间=20;this.弹幕滤除比例=0;
        this.上次时间点=0;this.是否发射=0;this.弹幕速度=6;
        this.videoPlayer;
        this.定时器ID;
        this.钟表=new Date();
        this.DEBUG_屏上清除记录=[]
    }

    加载弹幕(XML_path){
        let xmlDoc=读取xml(XML_path)
        var x=xmlDoc.getElementsByTagName("d");
        this.弹幕数量=x.length
        console.log("弹幕数量"+this.弹幕数量);
        
       
    

        let 弹幕i,弹幕属性,width,文本
        for (let i = 0; i < this.弹幕数量; i++){
            弹幕属性=x[i].getAttribute("p")
            弹幕属性=弹幕属性.split(",")
            文本=x[i].childNodes[0].nodeValue
            弹幕i = {
                time:parseFloat(弹幕属性[0]),
                文本:文本 ,
                类型:弹幕属性[1],
                color:"#"+parseInt(弹幕属性[3]).toString(16),
                飞行需用时ms:0,
                尾到站时刻ms:0,
                出线时刻ms:0,
                html实体:0,
                总航程: 0,
                width:0,
            }
            
            this.弹幕信息.push(弹幕i);
            
        }
        this.弹幕信息.sort(function(a,b){
            return a.time - b.time
        })
        console.log(this.弹幕信息);
        
    }
    建立航道(){
        this.航道信息 = [];
        this.航道数量=Math.floor(this.h/this.航道高度)
        for (let i = 0; i < this.航道数量; i++){
        let 航道i = {
            占用者:-1,
            占用状态:0,
            排队者:-1,
            排队者应出发时刻:0
            }
        this.航道信息.push(航道i);
        }
        
        console.log("航道数量"+this.航道数量);
        console.log(this.航道信息);
    }
    建立特殊航道(){
        this.特殊航道信息 = [];
        this.航道数量=Math.floor(this.h/this.航道高度)-1
        var Cnode;
        for (let i = 0; i < this.航道数量; i++){
            Cnode = document.createElement('div'); Cnode.classname="特殊航道创建" //审查元素时方便查看是哪个元素
            Cnode.style.height=this.航道高度+'px';Cnode.innerText="";Cnode.style.whiteSpace = 'nowrap';
            Cnode.style.position = 'relative';Cnode.style.left = '0px';Cnode.style.fontSize = this.航道高度+'px';Cnode.style.top = '0px';//设置top没有用  
            Cnode.style.textShadow='#000 0px 0px 2px,#000 0px 0px 1px,#000 0px 0px 1px'
            this.MY弹幕板.appendChild(Cnode)
            let 航道i = {
                占用者:0,
                占用状态:0,
                占用时间:0,
                html实体:Cnode}
            this.特殊航道信息.push(航道i);
        }
        console.log(this.特殊航道信息);
    }
   
    发射_draw(){
        if (this.是否发射){
                    


                    let t_now=视频API1_get视频进度(this);
                    var 应发射弹幕i=[];var 空闲航道i=[];var 空闲特殊航道i=[]; var 应发射特殊弹幕=[];
                    // console.log("当前视频进度:"+t_now+' 当前弹幕指针:',this.弹幕信息[this.弹幕指针].time)
                    for (let i = this.弹幕指针+1; i < this.弹幕数量; i++)//TODO:记得+1，先debug
                        {       
                                if(this.弹幕信息[i].time<=t_now){this.弹幕指针=i;
                                            if (Math.random()>=this.弹幕滤除比例){
                                                if(this.弹幕信息[i].类型=='1'){应发射弹幕i.push(i);}
                                                else{应发射特殊弹幕.push({index:i,time:0})}
                                            }
                                            
                                }
                                if(this.弹幕信息[i].time>t_now){break;}
                        }
                     
                    console.log()
                    for (let i = 0; i < this.航道数量; i++)
                        {
                            if (this.航道信息[i].占用状态==0){
                                空闲航道i.push(i);}
                        }    
                    // console.log("in draw可发射弹幕数:"+应发射弹幕i.length+" 空闲航道数:"+空闲航道i.length)
                                                    for (let i = 0; i < this.航道数量; i++)
                                                    {
                                                        if (this.特殊航道信息[i].占用状态==0){
                                                            空闲特殊航道i.push(i);}
                                                    }    

                    if(空闲航道i.length<应发射弹幕i.length){
                        let 应消除数量=应发射弹幕i.length-空闲航道i.length;
                        //TODO:消除位置，需要测试
                        let 消除位置=Math.floor(Math.random()*(应发射弹幕i.length-应消除数量))
                        应发射弹幕i.splice(消除位置 ,应消除数量)
                    }
                                    
                                            if(空闲特殊航道i.length<应发射特殊弹幕.length){
                                                let 应消除数量=应发射特殊弹幕.length-空闲特殊航道i.length;
                                                let 消除位置=Math.floor(Math.random()*(应发射特殊弹幕.length-应消除数量))
                                                应发射特殊弹幕.splice(消除位置 ,应消除数量)
                                                }

                    //应发射弹幕的数量小于等于空闲航道数量
                    for (let i = 0; i < 应发射弹幕i.length; i++){
                                    //把所有弹幕绘制到排队位置上
                                    //此时可以，并且进行了“读取并计算相关参数”
                                    
                                    let anode  = document.createElement('div');
                                    anode.style.height=this.航道高度+'px'
                                    anode.innerText=this.弹幕信息[应发射弹幕i[i]].文本
                                    anode.style.whiteSpace = 'nowrap';//不换行。不加入这行，那么碰到表格边框会换行
                                    anode.style.position = 'absolute';
                                    anode.style.color=this.弹幕信息[应发射弹幕i[i]].color
                                    anode.style.left = this.w+'px'; //另一种不换行的方法：先放在很远的地方-5000px，append node后测量宽度，设置硬性宽度后再left=700px
                                    anode.style.top = ((空闲航道i[i]+1)*this.航道高度)+'px';  
                                    anode.style.fontSize =this.航道高度+'px';
                                    //下面是样式视觉调整
                                    anode.style.textShadow='#000 0px 0px 2px,#000 0px 0px 1px,#000 0px 0px 1px'
                                    this.MY弹幕板.appendChild(anode)


                                    let node航程=700+(anode.offsetWidth)//start1 如果要查看html实体的清除情况，把这里的700改为600
                                    let node用时s=this.弹幕速度//node用时是常数，旨在每个弹幕被阅读的时间都一样
                                    let node速度=(node航程)/node用时s
                                    
                                    let 头到站需时ms=(700/node速度)*1000//end2 如果要查看html实体的清除情况，把这里的700改为600
                                     //-写入----------
                                    this.弹幕信息[应发射弹幕i[i]].飞行需用时ms=node用时s*1000//发射用
                                    this.弹幕信息[应发射弹幕i[i]].总航程=node航程//发射用
                                    this.弹幕信息[应发射弹幕i[i]].html实体=anode//发射用
                                    this.弹幕信息[应发射弹幕i[i]].width=anode.offsetWidth//防重叠
                                    //弹幕信息只剩下尾到站时刻ms没有写入，这个信息需要在发射时写入
                                    this.航道信息[空闲航道i[i]].排队者=应发射弹幕i[i];
                                    this.航道信息[空闲航道i[i]].占用状态=1;
                                    //-----------------
                                    //初始时刻要考虑下面这条代码，初始时所有航道的占用者=0
                                    if (this.航道信息[空闲航道i[i]].占用者!=-1){
                                        let 占用者尾到站时刻ms=this.弹幕信息[this.航道信息[空闲航道i[i]].占用者].尾到站时刻ms//用到占用者的地方1
                                        let 前短后长出发t=占用者尾到站时刻ms-头到站需时ms;
                                        let 前长后短出发t=this.弹幕信息[this.航道信息[空闲航道i[i]].占用者].出线时刻ms//用到占用者的地方2
                                        this.航道信息[空闲航道i[i]].排队者应出发时刻=Math.max(前短后长出发t,前长后短出发t)
                                    }else{
                                        this.航道信息[空闲航道i[i]].排队者应出发时刻=0;//没有人占用，立即出发！
                                        
                                    }
                                    
                                    
                                   
                                    
                                        
                                    // this.航道信息[空闲航道i[i]].排队者应出发时刻=this.弹幕信息[this.航道信息[空闲航道i[i]].占用者].出线时刻ms
                    
                                    
                           

                    }
                    if (this.特殊弹幕存留时间!=0)
                        {
                                                    for (let i = 0; i < 应发射特殊弹幕.length; i++){
                                                        let html实体  = this.特殊航道信息[空闲特殊航道i[i]].html实体
            
                                                        html实体.innerText=this.弹幕信息[应发射特殊弹幕[i].index].文本
                                                        html实体.style.color=this.弹幕信息[应发射特殊弹幕[i].index].color
                                                        
                                                        this.特殊航道信息[空闲特殊航道i[i]].占用者=应发射特殊弹幕[i].index;
                                                        this.特殊航道信息[空闲特殊航道i[i]].占用状态=1;
                                                        this.特殊航道信息[空闲特殊航道i[i]].占用时间=0;
                                                    }
                        }
                    // console.log( this.航道信息);
                    // console.log( this.屏上弹幕);
                    
                   
                    //开始发射
                    var 当前时刻=new Date().getTime() 
                    this.航道信息.forEach((航道,i) => {
                        if (航道.排队者!=-1){
                        //判断排队者是否可以起飞
                        if (当前时刻>航道.排队者应出发时刻){
                                //现在发射
                                this.弹幕信息[航道.排队者].html实体.style.transition = `transform ${(this.弹幕信息[航道.排队者].飞行需用时ms/1000)}s linear`;
                                this.弹幕信息[航道.排队者].html实体.style.transform = `translateX(-${this.弹幕信息[航道.排队者].总航程}px)`;
                                //用于计算下一个排队者的出发时刻
                                this.弹幕信息[航道.排队者].尾到站时刻ms=当前时刻+this.弹幕信息[航道.排队者].飞行需用时ms
                                this.弹幕信息[航道.排队者].出线时刻ms=当前时刻+this.弹幕信息[航道.排队者].飞行需用时ms*(this.弹幕信息[航道.排队者].width/this.弹幕信息[航道.排队者].总航程)
                                
                                航道.占用者=航道.排队者;
                                航道.排队者=-1;
                                航道.占用状态=0
                                //"占用者不为-1，同时又早就到站"的情况是没问题的
                                this.屏上弹幕.push({i:航道.占用者,已滚动L:0,})
                        }}
                    })
                    var delete_tmp=[]
                    this.屏上弹幕.forEach((弹幕,index) => {
                        // 如果屏上弹幕已经到站，那么立即HTML清除
                        
                        if (当前时刻>(this.弹幕信息[弹幕.i].尾到站时刻ms)){
                              this.MY弹幕板.removeChild(this.弹幕信息[弹幕.i].html实体);
                            //   this.DEBUG_屏上清除记录.push(弹幕.i)
                              delete_tmp.push(index)
                            }
                    })
                    //进行屏上弹幕i数据库的清理打扫
                    for (let i = 0; i < delete_tmp.length; i++) {
                        this.屏上弹幕.splice(delete_tmp[i]-i,1);
                    }
                                                        
                    if (this.特殊弹幕存留时间!=0)
                        {
                                                        
                                                        this.特殊航道信息.forEach((航道,i) => {
                                                                if (航道.占用状态==1){
                                                                    航道.占用时间+=1;
                                                                    if (航道.占用时间>this.特殊弹幕存留时间){
                                                                        航道.html实体.innerText=" "
                                                                        航道.占用状态=0}
                                                                }
                                                        })
                        }

        }
                   
                    
               
    }
    屏上弹幕清除() {
        this.屏上弹幕.forEach((屏弹幕,index) => {
            this.MY弹幕板.removeChild(this.弹幕信息[屏弹幕.i].html实体);
        })
        this.屏上弹幕=[]
        this.航道信息.forEach((航道,index) => {
            航道.占用者=0;
            if (航道.排队者!=-1){
            this.MY弹幕板.removeChild(this.弹幕信息[航道.排队者].html实体);
            航道.排队者=-1;
            航道.占用状态=0
            }
        })
        this.特殊航道信息.forEach((航道,index) => {
           
            航道.html实体.innerText=" "
            航道.占用状态=0
            
        })
    }
    占用者停止滚动(){
        this.屏上弹幕.forEach((屏弹幕,index) => {
                        let 弹幕实体=this.弹幕信息[屏弹幕.i].html实体
                        let 当前时刻=new Date().getTime()
                        let 弹幕出发t=this.弹幕信息[屏弹幕.i].尾到站时刻ms-this.弹幕信息[屏弹幕.i].飞行需用时ms
                        
                        //这里获取的是将要transform的距离，是700+width let 已transform距离=(弹幕实体.style.transform).match(/translateX\((.*)\px\)/)[1]
                        
                        let 已transform距离=1000*(当前时刻-弹幕出发t)*(this.弹幕信息[屏弹幕.i].总航程/(1000*this.弹幕信息[屏弹幕.i].飞行需用时ms))//速度单位是s
                        屏弹幕.已滚动L=已transform距离
                        屏弹幕.已滚动时间s=1000*(当前时刻-弹幕出发t)
                        // 取消动画，让弹幕停在原地
                        弹幕实体.style.transition = '';
                        弹幕实体.style.transform = `translateX(-${已transform距离}px)`;
                    })
    }
    占用者继续滚动(暂停时长){
         //暂停了多久，屏幕上所有弹幕的尾到站时刻ms，出线时刻ms
         //目前受影响的时间只有这两个
         this.屏上弹幕.forEach((屏弹幕,index) => {
                
                this.弹幕信息[屏弹幕.i].尾到站时刻ms+=暂停时长
                this.弹幕信息[屏弹幕.i].出线时刻ms+=暂停时长
                let 弹幕实体=this.弹幕信息[屏弹幕.i].html实体
                
                // console.log("继续滚动"+this.弹幕信息[屏弹幕.i].文本)
                // console.log("继续滚动剩余时间"+((this.弹幕信息[屏弹幕.i].尾到站时刻ms-当前时刻)/1000))
                弹幕实体.style.transition = `transform ${((this.弹幕信息[屏弹幕.i].尾到站时刻ms-new Date().getTime())/1000)}s linear`;
                弹幕实体.style.transform = `translateX(-${ this.弹幕信息[屏弹幕.i].总航程}px)`;


        })
   
    }
    排队者继续发射(暂停时长) {
        //暂停了多久，所有航道的'排队者应发射时间'就增加多少
        this.航道信息.forEach((航道,index) => {
            航道.排队者应出发时刻+=暂停时长
            
        })
        
    }
    

    重新测量弹幕长度(){
        this.弹幕信息.forEach((弹幕,index) => {
            let New_width  = Math.ceil(this.ctx.measureText(弹幕.文本).width)+20;
            弹幕.width=New_width;
        })
    }
    重定位弹幕指针(){
        let 当前时间=视频API1_get视频进度(DD)
        
        var tmp=0;
        for(let i=0;i<this.弹幕数量;i++){if(this.弹幕信息[i].time<当前时间){tmp=i;}else{break;}}
        this.弹幕指针=tmp
    }

}
//------------------------------Barrage类定义结束
//------------下面是容易变化的视频API部分
function 视频API1_get视频进度(DD){return DD.videoPlayer.currentTime();}
//-------------结束
function M3U8_draw_DanMu(Vedio_id,XML_path,debugIndex) {
    //---------初始化
        let DD = new DOM弹幕引擎();
        DD.加载弹幕(XML_path)
        DD.建立航道()
        DD.建立特殊航道()
        //要取消定时器，必须把ID传递出去，在末尾有return
        DD.定时器ID=setInterval(DD.发射_draw.bind(DD),150)//初始时 this.是否发射=0
    //初始化结束
    //---------下面是播放和暂停时对弹幕的处理
    function playing处理() {
            //视频暂停，然后点击播放的时刻，必须调用1次该函数
            //只能涉及1个视频api的操作，那就是读取视频进度ms
            let 当前播放t=视频API1_get视频进度(DD)
            console.log("a视频onplaying"+"  与上次播放时间间隔:"+(当前播放t-DD.上次时间点))
            DD.重定位弹幕指针()
            if ((Math.abs(DD.上次时间点-当前播放t))>5){
                console.log("大幅度拖拽了进度条,全部清空")
                DD.屏上弹幕清除();
            }
            DD.上次时间点=当前播放t//A015立即置于当前播放时刻
            
            let 暂停时长=new Date().getTime()-DD.暂停时刻
            DD.占用者继续滚动(暂停时长);
            DD.排队者继续发射(暂停时长);
            DD.是否发射=1;
    }
    function pause处理() {
            //只能涉及1个视频api的操作，那就是读取视频进度ms
            //只用于原地暂停，如果大幅度拖拽的话，那么所有数据库归零
            DD.暂停时刻=new Date().getTime()
            DD.是否发射=0
            DD.占用者停止滚动();console.log("视频onpause")
    }
    //----------以上部分两个引擎是一模一样的，也必须保持一模一样
//------------下面是容易变化的视频事件处理部分
  

    function timeUpdate处理_m3u8专门() {
        // console.log("视频播放中")
        // 实现：1秒更新4次
        //之所以要搞个指数加权平均。是因为大幅度拖拽进度条时 t0=1->拖动->t2=90->(onpause t=90)->(ontimeupdate t=90)->(onplaying t=90)->
        // v的滑动平均值大致等于过去 N=1/(1−β)个时刻vv v值的平均。β=0.9，N=10，是求过去两秒的平均值
        //这可以应对大幅度拖拽的情形，但是呢，在大幅度拖拽后迅速点击暂停开始，会发现平均值还是没有恢复到正常值的，又会清空弹幕，于是加入A015
        //如果把获取视频时间放在if TU运行的外面，那么销毁视频时会出错，除非在设置TU运行=0，然后等待240ms后再销毁视频
        if (DD.M3U8添加属性1_only1_TU运行){
            let a=debugIndex
            try{
                DD.上次时间点=(0.9*DD.上次时间点)+0.1*视频API1_get视频进度(DD)
            }catch{
                let a=1
            }
            
            setTimeout(timeUpdate处理_m3u8专门,240)
        }

        }
    //------------------------------结束
    //------------下面是视频事件监听部分
       
        //动态添加了一个属性
        DD.M3U8添加属性1_only1_TU运行=0;

        DD.videoPlayer  = videojs('myvideo', {bigPlayButton: true,textTrackDisplay: false,posterImage: false,errorDisplay: false},
        function onPlayerReady() {
                var  TU处理是否启动=0;//确保TU处理必须启动
                videojs.log('Your player is ready!');
                this.on("ended", function(){
                    console.log("视频播放结束");
                });
                this.on("loadstart",function(){
                    console.log("视频最开始会运行这个");
                    TU处理是否启动=1;DD.M3U8添加属性1_only1_TU运行=1;
                    timeUpdate处理_m3u8专门();
                });
                this.on("pause", function() {
                    console.log("pause");
                    pause处理()
                });
                this.on("playing", function(){
                    console.log("onplaying");
                    if (TU处理是否启动!=1){DD.M3U8添加属性1_only1_TU运行=1;timeUpdate处理_m3u8专门();}//确保TU处理必须启动
                    playing处理();       
                });
        }
        );
        

    //------------------------------结束
    //------------下面是键盘/触摸事件处理


    // DD.videoPlayer.onkeydown=键盘事件处理;
    document.onkeydown=键盘事件处理;//整个页面监听

    let a=document.getElementById("MY弹幕板");b=document.getElementById("弹幕开关")
    a.ontouchend=触摸事件处理;
    a.onclick=点击事件处理;
    function 点击事件处理(e){
        
       if (DD.videoPlayer.paused()) {DD.videoPlayer.play();//注意，videojs获取当前是否暂停是paused()
        } else {DD.videoPlayer.pause();}    
        console.log("点击"+DD.videoPlayer.paused());  
    }
    function 键盘事件处理 (e) {
        var e = e || window.event; 
                if (e.keyCode=="68"){//按下D
                    // console.log("D"+e.keyCode);  
                    if (DD.MY弹幕板.style.opacity==0){DD.MY弹幕板.style.opacity=1
                    }else{DD.MY弹幕板.style.opacity=0}
                    // if (DD.是否draw[0]){重定位弹幕指针(DD);DD.发射_draw();  }
                }
            }

    function 触摸事件处理 (e) {
        var e = e || window.event;  //标准化事件处理
        if ((navigator.userAgent.match(/(iPhone|iPod|Android|ios|iOS|iPad|Backerry|WebOS|Symbian|Windows Phone|Phone)/i))) 
        {
                if (DD.videoPlayer.paused()) {DD.videoPlayer().play();//注意，videojs获取当前是否暂停是函数paused()
                } else {DD.videoPlayer.pause();}  

        }
        
    }
    function 弹幕开关处理(){
        if (DD.MY弹幕板.style.opacity==0){DD.MY弹幕板.style.opacity=1
        }else{DD.MY弹幕板.style.opacity=0}
    }
    //------------------------------结束
    //------------下面是拖动条事件处理，每个引擎都一样
    var m拖动弹幕随机滤除=document.getElementById("range弹幕随机滤除")
    m拖动弹幕随机滤除.onchange=(function(e){
        DD.弹幕滤除比例=m拖动弹幕随机滤除.value*0.01;
        console.log("range条事件 "+m拖动弹幕随机滤除.value)
    })
    var m拖动弹幕速度=document.getElementById("range弹幕速度")
    m拖动弹幕速度.onchange=(function(e){
        DD.弹幕速度=Math.abs(12-m拖动弹幕速度.value*0.1);
        console.log("range条事件 "+m拖动弹幕速度.value)
    })
    var m拖动弹幕大小=document.getElementById("range弹幕大小")
    m拖动弹幕大小.onchange=(function(e){
        let value=m拖动弹幕大小.value
        
        DD.航道高度=value;
        DD.是否发射=0;//防止冲突
        DD.屏上弹幕清除()//无所谓，just视觉效果
        //滚动弹幕的清除基于屏上弹幕库的记录和弹幕自身的到站信息。
        //而特殊弹幕的清除基于特殊航道（特殊航道就是个html元素，清除弹幕就是设置文字为空），如果不把特殊航道给删除，那么就会累积出N个特殊航道
        //现在删除特殊航道
        DD.特殊航道信息.forEach((航道,i)=>{
            DD.MY弹幕板.removeChild(航道.html实体)
        })
        DD.建立航道(); DD.建立特殊航道();
        DD.是否发射=1;
        // console.log("range条事件 "+m拖动弹幕大小.value)
        // DD.是否draw[1]=1; DD.发射_draw();
    })

    var m拖动弹幕存留时间=document.getElementById("range顶部弹幕存留时间")
    m拖动弹幕存留时间.onchange=(function(e){
        DD.特殊弹幕存留时间=m拖动弹幕存留时间.value;
        console.log("range条事件 "+m拖动弹幕存留时间.value)
    })
    //------------------------------结束
    return DD;
    }

    function 模拟M3U8_draw_DanMu(index){
        class DOM弹幕引擎 {
            
            constructor(index) {
                this.MY弹幕板 = document.getElementById("MY弹幕板");
                this.index=index
                this.定时器ID;
                }
            发射_draw(){
                console.log("from 视频 index "+DD.index)
            }
            清除定时器(){
                this.clearInterval(this.定时器ID);
            }
        
        }

            let DD=new DOM弹幕引擎(index)
            DD.定时器ID=setInterval(DD.发射_draw.bind(DD),1000)//初始时
            
            return DD;
}