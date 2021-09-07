import { jest, describe, test, expect } from '@jest/globals';
import Routes from '../../routes.js';

const defaultParams = {
  request: {
    headers: {
      'Contet-Type': 'multipart/form-data'
    },
    method: '',
    body: {}
  },
  response: {
    setHeader: jest.fn(),
    writeHead: jest.fn(),
    end: jest.fn()
  },
  values: () => Object.values(defaultParams)
};

const makeRoutes = async method => {
  const routes = new Routes();
  const params = { ...defaultParams };

  params.request.method = method;

  return { routes, params };
};

describe('#Routes test suite', () => {
  describe('#setSocketInstance', () => {
    test('setSocket should store io instance', () => {
      const routes = new Routes();
      const ioObj = {
        to: id => ioObj,
        emit: (event, message) => {}
      };

      routes.setSocketInstance(ioObj);
      expect(routes.io).toStrictEqual(ioObj);
    });
  });

  describe('#handler', () => {
    test('given an inexistent route it should choose default route', async () => {
      const { routes, params } = await makeRoutes('inexistent');
      await routes.handler(...params.values());

      expect(params.response.end).toBeCalledWith('hello world');
    });

    test('it should set any request with CORS enabled', async () => {
      const { routes, params } = await makeRoutes('inexistent');
      await routes.handler(...params.values());

      expect(params.response.setHeader).toBeCalledWith('Access-Control-Allow-Origin', '*');
    });

    test('given method OPTIONS it should choose options route', async () => {
      const { routes, params } = await makeRoutes('OPTIONS');
      await routes.handler(...params.values());

      expect(params.response.writeHead).toBeCalledWith(204);
      expect(params.response.end).toBeCalled();
    });

    test('given method POST it should choose post route', async () => {
      const { routes, params } = await makeRoutes('POST');
      jest.spyOn(routes, routes.post.name).mockResolvedValue();
      await routes.handler(...params.values());

      expect(routes.post).toBeCalled();
    });

    test('given method GET it should choose get route', async () => {
      const { routes, params } = await makeRoutes('GET');
      jest.spyOn(routes, routes.get.name).mockResolvedValue();
      await routes.handler(...params.values());

      expect(routes.get).toBeCalled();
    });
  });

  describe('#get', () => {
    test('given method GET it should list all files downloaded', async () => {
      const { routes, params } = await makeRoutes('GET');

      const filesStatusesMock = [
        {
          size: '188 kB',
          lastModified: '2021-09-03T20:56:28.443Z',
          owner: 'erickwendel',
          file: 'file.txt'
        }
      ];

      jest.spyOn(routes.fileHelper, routes.fileHelper.getFileStatus.name).mockResolvedValue(filesStatusesMock);
      await routes.handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(200);
      expect(params.response.end).toHaveBeenCalledWith(JSON.stringify(filesStatusesMock));
    });
  });
});
