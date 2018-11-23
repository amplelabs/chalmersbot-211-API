const common = require('../lib/common')

test('adds 1 + 2 to equal 3', () => {
  expect(common.sum(1, 2)).toBe(3)
})

describe('General 2-1-1 Trial API testing', () => {
  const listOfTopicTestMsg = 'List of Topics in English'
  test(listOfTopicTestMsg, () => {
    console.log(listOfTopicTestMsg)
    const expectedTopics = [
      'Community Programs',
      'Family services',
      'Health Care',
      'Disabilities',
      'Mental Health / Addictions',
      'Indigenous Peoples',
      'Employment / Training',
      'Housing',
      'Government / Legal',
      'Older Adults'
    ]
    expect.assertions(1)
    return common.listTopic().then((topic) => {
      expect(topic).toEqual(expectedTopics)
    })
  })
})
