import { jest, describe, test, expect } from '@jest/globals';
import fs from 'fs';
import FileHelper from '../../fileHelper.js';
import Routes from '../../routes.js';

describe('#FileHelper', () => {
  describe('#getFileStatus', () => {
    test('it should return files statuses in correct format', async () => {
      const statMock = {
        dev: 4106631467,
        mode: 33206,
        nlink: 1,
        uid: 0,
        gid: 0,
        rdev: 0,
        blksize: 4096,
        ino: 2251799814046250,
        size: 459921,
        blocks: 904,
        atimeMs: 1630977131111.6553,
        mtimeMs: 1630977130993.9998,
        ctimeMs: 1630977130994.6587,
        birthtimeMs: 1630977019437.0789,
        atime: '2021-09-07T01:12:11.112Z',
        mtime: '2021-09-07T01:12:10.994Z',
        ctime: '2021-09-07T01:12:10.995Z',
        birthtime: '2021-09-07T01:10:19.437Z'
      };

      const mockUser = 'victor';
      process.env.USER = mockUser;
      const filename = 'doc.pdf';
      jest.spyOn(fs.promises, fs.promises.readdir.name).mockResolvedValue([filename]);
      jest.spyOn(fs.promises, fs.promises.stat.name).mockResolvedValue(statMock);

      const result = await FileHelper.getFileStatus('/tmp');

      const expectedResult = [
        {
          size: '460 kB',
          lastModified: statMock.birthtime,
          owner: mockUser,
          file: filename
        }
      ];

      expect(fs.promises.stat).toHaveBeenCalledWith(`/tmp/${filename}`);
      expect(result).toMatchObject(expectedResult);
    });
  });
});
