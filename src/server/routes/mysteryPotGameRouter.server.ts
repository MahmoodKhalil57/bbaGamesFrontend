import { prisma } from '$api/clients/prisma.server';
import { privateProcedure } from '$api/preRequest/middleware.server';
import type { APITypeB } from '$lib/apiUtils/server/ApiUtils.type.server';
import { responseStatus, getResponse } from '$lib/apiUtils/server/apiUtils.server';

export default {
	getUnusedMysteryPotGameLobby: async ({ ctx, input }) => {
		ctx.status = responseStatus.INTERNAL_SERVER_ERROR;
		let lobbyId: number | null = null;
		try {
			const min = 10 ** 11;
			const max = 10 ** 12;
			lobbyId = Math.floor(Math.random() * (max - min + 1)) + min;

			ctx.status = responseStatus.SUCCESS;
		} catch (e) {
			console.log(e);
		}

		return getResponse(ctx.status, {
			[responseStatus.INTERNAL_SERVER_ERROR]: {
				message: ''
			},
			[responseStatus.SUCCESS]: {
				data: { lobbyId }
			}
		});
	},
	addMessage: async ({ ctx, input }) => {
		const { privateCtx } = await privateProcedure(ctx);
		ctx.status = responseStatus.INTERNAL_SERVER_ERROR;
		let lobbyId: string | null = null;
		try {
			lobbyId = (
				await prisma.mysteryPactLobbyMessages
					.create({
						data: {
							mysteryPactLobbyId: input.lobbyId,
							message: input.message,
							authUserId: privateCtx.sessionUser.userId
						}
					})
					.lobby()
			).id;
			ctx.status = responseStatus.SUCCESS;
		} catch (e) {
			console.log(e);
		}

		return getResponse(ctx.status, {
			[responseStatus.INTERNAL_SERVER_ERROR]: {
				message: ''
			},
			[responseStatus.SUCCESS]: {
				data: { lobbyId }
			}
		});
	}
} satisfies APITypeB<'mysteryPotGameRouter'>;
