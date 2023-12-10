class PostForListDto {
    id;
    title;
    status;
    content;
    author_id;
    author_name;
    author_avatar;
    publish_date;
    categories;
    reactions;

    constructor(model, contentPreview, author_name, author_avatar, categories, reactions) {
      this.id = model.id;
      this.title = model.title;
      this.status = model.status;
      this.content = contentPreview;
      this.author_id = model.author_id;
      this.author_name = author_name;
      this.author_avatar = author_avatar;
      this.publish_date = model.publish_date;
      this.categories = categories;
      this.reactions = reactions;
    }
  }
  
  module.exports = PostForListDto;