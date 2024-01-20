class CommentDto {
    id;
    content;
    author_id;
    author_name;
    author_login;
    author_avatar;
    publish_date;
    reply;
    postId;
    marked_as_answer;
    reactions;

    constructor(model, author_name, author_avatar, postId, reactions) {
      this.id = model.id;
      this.content = model.content;
      this.author_id = model.author_id;
      this.author_name = author_name;
      this.marked_as_answer = model.marked_as_answer
      this.author_avatar = author_avatar;
      this.publish_date = model.publish_date;
      this.reply = model.reply;
      this.postId = postId;
      this.reactions = reactions;
    }
  }
  
  module.exports = CommentDto;