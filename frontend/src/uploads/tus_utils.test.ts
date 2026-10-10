import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi
} from "vitest";

import { deleteUpload } from "./tus_utils.ts";

const FILE_URL = "http://tus_endpoint.net/upload/file-id-1";

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe("deleteUpload", () => {
  test("sends a delete request with the tus and csrf headers", async () => {
    const onRequest = vi.fn<(request: Request) => void>();
    server.use(
      http.delete(FILE_URL, ({ request }) => {
        onRequest(request);
        return new HttpResponse(null, { status: 204 });
      })
    );

    await deleteUpload(FILE_URL, "csrf1");

    expect(onRequest).toHaveBeenCalledOnce();

    const request = onRequest.mock.calls[0]?.[0];

    expect(request?.headers.get("Tus-Resumable")).toBe("1.0.0");
    expect(request?.headers.get("X-CSRFToken")).toBe("csrf1");
  });

  test("resolves when the server responds with 204", async () => {
    server.use(
      http.delete(FILE_URL, () => new HttpResponse(null, { status: 204 }))
    );

    await expect(deleteUpload(FILE_URL, "csrf1")).resolves.toBeUndefined();
  });

  test.each([200, 404, 500])(
    "rejects when the server responds with %i",
    async status => {
      server.use(
        http.delete(FILE_URL, () => new HttpResponse(null, { status }))
      );

      await expect(deleteUpload(FILE_URL, "csrf1")).rejects.toThrow(
        "Delete failed"
      );
    }
  );
});
