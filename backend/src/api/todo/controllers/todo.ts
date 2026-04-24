"use strict";

export default {

  async create(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { data } = ctx.request.body;

    const todo = await strapi.documents("api::todo.todo").create({
      data: {
        title: data.title,
        isCompleted: false,
        user: user.id,
      },
    });

    return { data: todo };
  },

  async find(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const todos = await strapi.documents("api::todo.todo").findMany({
      filters: { user: user.id },
    });

    return { data: todos };
  },

  async findOne(ctx: any) {
    const user = ctx.state.user;
    const documentId = ctx.params.id;
    if (!user) return ctx.unauthorized();

    const todo = await strapi.documents("api::todo.todo").findOne({
      documentId,
    });

    if (!todo || String((todo as any).user) !== String(user.id)) {
      return ctx.forbidden("Not your todo");
    }

    return { data: todo };
  },

  async update(ctx: any) {
    const user = ctx.state.user;
    const documentId = ctx.params.id;
    if (!user) return ctx.unauthorized();

    const existing = await strapi.documents("api::todo.todo").findOne({
      documentId,
    });

    if (!existing) {
      return ctx.notFound();
    }

    const updated = await strapi.documents("api::todo.todo").update({
      documentId,
      data: ctx.request.body.data,
    });

    return { data: updated };
  },

  async delete(ctx: any) {
    const user = ctx.state.user;
    const documentId = ctx.params.id;
    if (!user) return ctx.unauthorized();

    const existing = await strapi.documents("api::todo.todo").findOne({
      documentId,
    });

    if (!existing) {
      return ctx.notFound();
    }

    await strapi.documents("api::todo.todo").delete({
      documentId,
    });

    return { message: "Deleted successfully" };
  },
};