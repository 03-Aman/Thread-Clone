import { Avatar, Divider, Flex, Image, Skeleton, SkeletonCircle, Text, useColorModeValue } from '@chakra-ui/react'
import React from 'react'

const MessageContainer = () => {
    return <Flex flex={70}
    bg={useColorModeValue("gray.200", "gray.dark")}
    borderRadius={"md"}
    flexDirection={"column"}
    p={2}
  >
    {/* {message header} */}
    <Flex w={"full"} h={12} alignItems={"center"} gap={2}>
        <Avatar size={"sm"} src=''/>
        <Text display={"flex"} alignItems={"center"}>
            John Doe <Image src='/verified.png' w={4} h={4} ml={1}/>
        </Text>
    </Flex>

    <Divider />

    <Flex flexDirection={"column"} gap={4} my={4}
        height={"400px"} overflowY={"scroll"}
    > 
        {true && (
            [...Array(5)].map((_, i) => (
                <Flex key={i}
                 gap={2}
                 aligbItems={"center"}
                 p={1}
                 borderRadius={"md"}
                 alignSelf={i%2===0 ? "flex-start" : "flex-end"}
                >
                    {i%2===0 && <SkeletonCircle size={7} />}
                    <Flex flexDirection={"column"} gap={2}>
                        <Skeleton h={"8px"} w={"250px"} />
                        <Skeleton h={"8px"} w={"250px"} />
                        <Skeleton h={"8px"} w={"250px"} />
                    </Flex>
                    {i%2!==0 && <SkeletonCircle size={7} />}
                </Flex>
            ))
        )}
    </Flex>
  </Flex>

}

export default MessageContainer
