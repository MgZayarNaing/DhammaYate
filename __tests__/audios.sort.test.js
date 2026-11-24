import {dhammaAudios} from '../src/data/audios';

test('audio sort ranks order titles by ascending length', () => {
  const sortedAudios = [...dhammaAudios].sort((a, b) => a.sort - b.sort);

  expect(sortedAudios.map(audio => audio.sort)).toEqual(
    dhammaAudios.map((_, index) => index),
  );
  for (let index = 1; index < sortedAudios.length; index += 1) {
    expect(sortedAudios[index - 1].title.length).toBeLessThanOrEqual(
      sortedAudios[index].title.length,
    );
  }
});
