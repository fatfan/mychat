(function($){
	//alert(1);
	var User = Backbone.Model.extend({
        urlRoot: '/user',
        /*defaults:{
        	id:"1",
        	name:"ff"
        }*/
    });
    var Topic = Backbone.Model.extend({
    	urlRoot: '/topic'
    });
    var Topics = Backbone.Collection.extend({
    	url: '/topic',
    	model: Topic,
    	getTopic:function(topic_id){
    		return this.where({id:1});
    	}
    });
    var topics = new Topics;
    var Message = Backbone.Model.extend({
    	urlRoot: '/message'
    });
    var Messages = Backbone.Collection.extend({
    	url: '/message',
    	model: Message
    });

	var LoginView = Backbone.View.extend({
		el:$(".login"),
		wrap:$(".login"),
		//user:$(".user"),
		//pass:$(".pass"),
		initialize:function(){},
		events:{
			"click #btnLogin":"onLoginClick",
			"click #btnRegister":"onRegisterClick"
		},
		show:function(){
			this.$el.show();
		},
		hide:function(){
			this.$el.hide();
		},
		onLoginClick:function(){
			//alert(this.user.val());
			var username_input = $('.user');
            var pwd_input = $('.pass');
            var u = new User({
                username: username_input.val(),
                password: pwd_input.val(),
            });
            u.save(null, {
                url: '/login',
                success: function(model, resp, options){
                    g_user = resp;
                    // 跳转到index
                    appRouter.navigate('index', {trigger: true});
                },
                error: function(model, resp, options) {
                    alert(resp.responseText);
                }
            });
		},
		onRegisterClick:function(){
			var username_input = $('#reg_user').val();
            var pwd_input = $('#reg_pass').val();
            //alert(username_input);
            var u = new User({
                username: username_input,
                password: pwd_input,
                password_repeat: pwd_input,
            });
            u.save(null, {
                success: function(model, resp, options){
                    g_user = resp;
                    // 跳转到index
                    appRouter.navigate('index', {trigger: true});
                },
                error: function(model, resp, options) {
                    alert(resp.responseText);
                }
            });
		}
	});
	var UserView = Backbone.View.extend({
		initialize:function(){},
		events:{}
	});
	var TopicView = Backbone.View.extend({
		tagName:  "div",
        template: _.template($('#tpl_topic').html()),

        // 渲染列表页模板
        render: function() {
        	$(this.el).html(this.template(this.model.toJSON()));
        	$(this.el).addClass("u-topic");
        	return this;
        }
	});
	var MessageView = Backbone.View.extend({
		tagName:  "div",
        template: _.template($('#tpl_message').html()),

        // 渲染列表页模板
        render: function() {
        	$(this.el).html(this.template(this.model.toJSON()));
        	$(this.el).addClass("f-cb");
        	return this;
        }
	});
	var messages= new Messages;
	var AppView = Backbone.View.extend({
		el:".main",
		topic_section:$(".section_topic"),
		message_section:$(".section_message"),
		message_list:$(".m-msgList"),

		initialize:function(){
			topics.bind("add",this.addTopic);
			messages.bind("add",this.addMsg);
			this.message_pool = {};
		},
		events:{
			"click #btnAddTopic":"onClickAddTopic",
			"click #btnSendMsg":"onClickSendMsg"
		},
		showTopic:function(){
			topics.fetch();
			this.topic_section.show();
            this.message_section.hide();
            this.message_list.html('');
		},
		testAdd:function(){
			alert("text");
		},
		/*
		initMessage:function(topic_id){
			var messages = new Messages;
            messages.bind('add', this.addMsg);
            this.message_pool[topic_id] = messages;
		},*/
		showMessage:function(topic_id){
			//this.initMessage(topic_id);
			//var messages = this.message_pool[topic_id];
			messages.fetch({
				data: {topic_id: topic_id}
			});
			
			this.topic_section.hide();
			this.message_section.show();
			//var e= topics.where({"topic_id":topic_id});
			//var e=topics.getTopic(topic_id);
			//var t=e[0].get("title");
			//$("#topic_title").html(t);
			this.showMessageHead(topic_id);
			$('#msgTitle').attr('topic_id', topic_id);
		},
		showMessageHead: function(topic_id) {
            var topic = new Topic({id: topic_id});
            self = this;
            topic.fetch({
                success: function(resp, model, options){
                    $("#topic_title").html(model.title);
                },
                error: function(model, resp, options) {
                    alert(resp.responseText);
                }
            });
        },
		onClickAddTopic:function(){
			var topic_title=$("#topicTitle");
			if (topic_title.val() == '') {
                alert('主题不能为空！');
                return false
            }
            var topic = new Topic({
                title: topic_title.val(),
            });
            self = this;
            topic.save(null, {
                success: function(model, response, options){
                    topics.add(response);
                    topic_title.val('');
                },
                error: function(model, resp, options) {
                    alert(resp.responseText);
                }
            });
		},
		addTopic:function(topic){
			var ele=new TopicView({model:topic});
			var view=ele.render().el;
			$(".m-topicList").append(ele.render().el);
		},
		onClickSendMsg:function(){
			var comment_box = $('#msgTitle')
            var content = comment_box.val();
            if (content == '') {
                alert('内容不能为空');
                return false;
            }
            var topic_id = comment_box.attr('topic_id');
            var message = new Message({
                content: content,
                topic_id: topic_id,
            });

            message.save(null,{
            	success: function(){
            		//messages.add()
            		alert("send success");
            		messages.reset();
            	},
            	error: function(){
            		alert("消息发送失败");
            	}
            }); // 依赖上面对sync的重载
            //var messages = this.message_pool[topic_id];
            var tmp={
            	"user_id": g_user.id, 
            	"is_mine": true, 
            	"content": content, 
            	"topic_id": topic_id, 
            	"created_time": (new Date()).toLocaleString(), 
            	"user_name": g_user.username, 
            	"id": 10000
            }
            messages.add(tmp);
            comment_box.val('');
		},
		addMsg:function(message){
			var ele=new MessageView({model:message});
			var view=ele.render().el;
			$(".m-msgList").append(ele.render().el);
		},
	});
	var AppRouter = Backbone.Router.extend({
        routes: {
            "login": "login",
            "index": "index",
            "topic/:id" : "topic",
        },

        initialize: function(){
            // 初始化项目, 显示首页
            this.appView = new AppView();
            this.loginView = new LoginView();
            this.userView = new UserView();
            this.indexFlag = false;
        },

        login: function(){
        	//alert("login");
            this.loginView.show();
        },

        index: function(){
        	//alert("index");
            if (g_user && g_user.id != undefined) {
                this.appView.showTopic();
                //this.userView.show(g_user.username);
                this.loginView.hide();
                this.indexFlag = true;  // 标志已经到达主页了
            }
        },

        topic: function(topic_id) {
            if (g_user && g_user.id != undefined) {
                this.appView.showMessage(topic_id);
                //this.userView.show(g_user.username);
                this.loginView.hide();
                this.indexFlag = true;  // 标志已经到达主页了
            }
        },
    });

    var appRouter = new AppRouter();
    //var g_user=new User;
    //Backbone.history.start();

    //appRouter.navigate('index', {trigger: true});
    
    var g_user = new User;
    g_user.fetch({
        success: function(model, resp, options){
            g_user = resp;
            Backbone.history.start({pustState: true});
            //g_user={"id":1,"username":"ff"};
            if(g_user === null || g_user.id === undefined) {
                // 跳转到登录页面
                appRouter.navigate('login', {trigger: true});
            } else if (appRouter.indexFlag == false){
                // 跳转到首页
                appRouter.navigate('index', {trigger: true});
            }
        },
        error: function(model, resp, options) {
            alert(resp.responseText);
        }
    }); // 获取当前用户

	/*
	var Product = Backbone.Model.extend({
		urlRoot:"/product",
		defaults:function(){
			return {
				title:"",
				price:-1,
				discountPrice:-1,
				description:"",
				imgPath:""
			};
		}
	});
	var ProductList = Backbone.Collection.extend({
		url:"/products/",
		model:Product,
	    //comparator: 'price'
	});
	//var products = new ProductList;
	var ProductView = Backbone.View.extend({
		//tagName:"li",
		template: _.template($("#tpl_product").html()),
		initialize: function(){
			//this.listenTo(this.model, 'change', this.render);
      		//this.listenTo(this.model, 'destroy', this.remove);
      		//this.render();
		},
		render:function(){
			this.$el.html(this.template(this.model.toJSON()));
			//this.$el.toggleClass("done",this.model.get("done"));
			//this.input=this.$(".edit");
			return this;
		},
		events:{
			"click .u-product":"onClickProduct",
		},
		onClickProduct:function(){
			//this.model.toggle();
			alert(this.model.get("title")+" clicked");
			appView.page="detail";
		}
	});

	var AppView = Backbone.View.extend({
		el:$("#mymall"),
		//page:"list",
		//statusTemplate:_.template($("#tpl_status").html()),
		initialize:function(){
			this.page="list";
			this.listenTo(products, 'add', this.addOne);
			//this.listenTo(this.page,'all',this.changePage);
			this.bind("change:page",function(){
                    var name= this.get("page");
                    alert("name变成了:"+name);
                });
			products.fetch();
			//this.render();
		},
		render:function(){
			alert("r");
			products.each(function(product){
				var view = new ProductView({model: product});
				var _html=view.render().el;
      			this.$(".m-productList").append(view.render().el);
			});
		},
		events:{
			"keypress #new_todo": "createOnEnter",

		},
		createOnEnter:function(e){
			//alert(1);
		},
		addOne:function(product){
			var view = new ProductView({model: product});
			//var _html=view.render().$el;
      		this.$(".m-productList").append(view.render().$el.html());
		},
		changePage:function(page){
			alert(page);

		}
	});
	*/
})(jQuery);